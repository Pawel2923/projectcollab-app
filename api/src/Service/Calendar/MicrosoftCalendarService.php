<?php

namespace App\Service\Calendar;

use ApiPlatform\Metadata\Exception\AccessDeniedException;
use App\Entity\Issue;
use App\Entity\IssueCalendarEvent;
use App\Entity\User;
use App\Entity\UserOAuth;
use App\Repository\IssueCalendarEventRepository;
use App\Repository\IssueRepository;
use App\Repository\UserOAuthRepository;
use App\Security\ProviderService;
use App\Util\UrlManagerInterface;
use DateMalformedStringException;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrosoftCalendarService extends CalendarService
{
    public function __construct(
        EntityManagerInterface                        $entityManager,
        LoggerInterface                               $logger,
        ProviderService                               $provider,
        private readonly HttpClientInterface          $microsoftGraphClient,
        private readonly UserOAuthRepository          $userOAuthRepository,
        private readonly IssueCalendarEventRepository $issueCalendarEventRepository,
        private readonly IssueRepository              $issueRepository,
        private readonly UrlManagerInterface          $urlManager
    )
    {
        parent::__construct($entityManager, $logger, $provider);
    }

    /**
     * @inheritDoc
     * @param User $user
     * @param Issue[] $issues
     * @throws TransportExceptionInterface
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface|DateMalformedStringException
     */
    public function syncIssues(User $user, array $issues): void
    {
        $userOAuth = $this->userOAuthRepository->findOneBy(['user' => $user, 'provider' => 'microsoft-entra-id']);
        if (!$userOAuth) {
            $this->logger->warning('MicrosoftCalendarService: User does not have OAuth');
            throw new AccessDeniedException();
        }

        if (!$this->validateTokens($userOAuth, 'microsoft-entra-id')) {
            $this->logger->warning('MicrosoftCalendarService: User does not have valid OAuth tokens');
            throw new AccessDeniedException();
        }

        $chunks = $this->buildChunkedPayload($issues);

        foreach ($chunks as $chunk) {
            try {
                $response = $this->microsoftGraphClient->request('POST', '$batch', [
                    'auth_bearer' => $userOAuth->getAccessToken(),
                    'json' => ['requests' => $chunk]
                ]);

                $this->saveEventIdsFromResponse($response->toArray(), $userOAuth);
            } catch (ClientExceptionInterface $e) {
                $this->logger->error('MicrosoftCalendarService: Request failed', [
                    'status' => $e->getResponse()->getStatusCode(),
                    'content' => $e->getResponse()->getContent(false),
                ]);
                throw $e;
            }
        }

        $this->entityManager->flush();
    }

    /**
     * Build batch payload and chunk it
     * @param Issue[] $issues
     * @return array
     * @throws DateMalformedStringException
     */
    private function buildChunkedPayload(array $issues): array
    {
        $requests = [];

        $existingEvents = $this->issueCalendarEventRepository->findBy(['issue' => $issues, 'provider' => 'microsoft-entra-id']);
        $eventMap = [];
        foreach ($existingEvents as $event) {
            $eventMap[$event->getIssue()->getId()] = $event;
        }

        foreach ($issues as $issue) {
            $isUpdate = isset($eventMap[$issue->getId()]);
            /** @var IssueCalendarEvent|null $existingEvent */
            $existingEvent = $isUpdate ? $eventMap[$issue->getId()] : null;

            $requests[] = [
                'id' => (string)$issue->getId(),
                'method' => $isUpdate ? 'PATCH' : 'POST',
                'url' => $isUpdate ? "/me/events/{$existingEvent->getExternalEventId()}" : '/me/events',
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'body' => $this->createMicrosoftEventBody($issue),
            ];
        }

        return array_chunk($requests, 20);
    }

    /**
     * Update issue event or create it
     * @param array $results
     * @param UserOAuth $userOAuth
     * @return void
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    private function saveEventIdsFromResponse(array $results, UserOAuth $userOAuth): void
    {
        foreach ($results['responses'] as $response) {
            $issueEvent = $this->issueCalendarEventRepository->findOneBy(['issue' => $response['id'], 'provider' => 'microsoft-entra-id']);
            if (!$issueEvent) {
                $issue = $this->issueRepository->find($response['id']);
                if (!$issue) {
                    $this->logger->warning('MicrosoftCalendarService: Issue not found');
                    throw new NotFoundHttpException('Issue not found');
                }

                $issueEvent = new IssueCalendarEvent()
                    ->setIssue($issue)
                    ->setProvider('microsoft-entra-id')
                    ->setExternalHtmlLink($response['body']['webLink']);
            }

            if ($response['status'] === 404 || $response['status'] === 410) {
                $this->logger->warning("MicrosoftCalendarService: Event for issue {$response['id']} not found on remote (404/410). Re-creating.");
                $issue = $issueEvent->getIssue();

                try {
                    $retryResponse = $this->microsoftGraphClient->request('POST', 'me/events', [
                        'auth_bearer' => $userOAuth->getAccessToken(),
                        'json' => $this->createMicrosoftEventBody($issue)
                    ]);

                    if ($retryResponse->getStatusCode() === 201) {
                        $eventData = $retryResponse->toArray();
                        $issueEvent->setExternalEventId($eventData['id'])
                            ->setExternalHtmlLink($eventData['webLink'])
                            ->setLastSyncedAt(new DateTimeImmutable());
                        $this->logger->info("MicrosoftCalendarService: Successfully re-created event for issue {$issue->getId()}. Link: {$eventData['webLink']}");
                    }
                } catch (Exception $e) {
                    $this->logger->error("MicrosoftCalendarService: Failed to re-create event: " . $e->getMessage());
                }
            } elseif ($response['status'] !== 200 && $response['status'] !== 201) {
                $this->logger->warning("MicrosoftCalendarService: Unexpected status {$response['status']} for issue {$response['id']}. Body: " . json_encode($response['body'] ?? []));
            }

            if ($response['status'] === 201 || $response['status'] === 200) {
                $eventData = $response['body'];

                $issueEvent->setExternalEventId($eventData['id'])
                    ->setLastSyncedAt(new DateTimeImmutable());

                $this->logger->debug('MicrosoftCalendarService: event data', ['eventData' => $eventData]);
            }

            $this->entityManager->persist($issueEvent);
        }
    }

    /**
     * @throws DateMalformedStringException
     */
    private function createMicrosoftEventBody(Issue $issue): array
    {
        return [
            'subject' => "{$issue->getKey()} - {$issue->getTitle()}",
            'isAllDay' => true,
            'start' => [
                'dateTime' => $issue->getStartDate()->format('Y-m-d\T00:00:00'),
                'timeZone' => 'UTC',
            ],
            'end' => [
                'dateTime' => DateTime::createFromInterface($issue->getEndDate())->modify('+1 day')->format('Y-m-d\T00:00:00'),
                'timeZone' => 'UTC',
            ],
            'body' => [
                'contentType' => 'HTML',
                'content' => "{$issue->getDescription()}<br/><a href='{$this->urlManager->getFrontendUrl()}/organizations/{$issue->getProject()->getOrganization()->getId()}/projects/{$issue->getProject()->getId()}/issues/{$issue->getId()}'>Przejdź do zadania</a>",
            ]
        ];
    }
}
