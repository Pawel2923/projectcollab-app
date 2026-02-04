<?php

namespace App\Service\Calendar;

use ApiPlatform\Metadata\Exception\AccessDeniedException;
use App\Entity\Issue;
use App\Entity\IssueCalendarEvent;
use App\Entity\User;
use App\Repository\IssueCalendarEventRepository;
use App\Repository\IssueRepository;
use App\Repository\UserOAuthRepository;
use App\Security\ProviderService;
use App\Util\UrlManagerInterface;
use DateMalformedStringException;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Google\Client;
use Google\Service\Calendar;
use Google\Service\Exception;
use GuzzleHttp\Psr7\Utils;
use Psr\Http\Message\RequestInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GoogleCalendarService extends CalendarService
{
    public function __construct(
        EntityManagerInterface                        $entityManager,
        LoggerInterface                               $logger,
        ProviderService                               $provider,
        private readonly UserOAuthRepository          $userOAuthRepository,
        private readonly IssueRepository              $issueRepository,
        private readonly IssueCalendarEventRepository $issueCalendarEventRepository,
        private readonly Client                       $googleClient,
        private readonly UrlManagerInterface          $urlManager,
    )
    {
        parent::__construct($entityManager, $logger, $provider);
    }

    /**
     * @inheritDoc
     * @throws \Exception
     */
    public function syncIssues(User $user, array $issues): void
    {
        $userOAuth = $this->userOAuthRepository->findOneBy(['user' => $user, 'provider' => 'google']);
        if (!$userOAuth) {
            $this->logger->warning('GoogleCalendarService: User does not have OAuth');
            throw new AccessDeniedException();
        }

        if (!$this->validateTokens($userOAuth, 'google')) {
            $this->logger->warning('GoogleCalendarService: User does not have valid OAuth tokens');
            throw new AccessDeniedException();
        }

        $this->googleClient->setAccessToken($userOAuth->getAccessToken());
        // Queue requests instead of executing immediately
        $this->googleClient->setDefer(true);

        $builtBatch = $this->buildBatch($issues);
        $requestCount = $builtBatch['requestCount'];
        $batch = $builtBatch['batch'];

        $this->googleClient->setDefer(false);

        if ($requestCount === 0) {
            $this->logger->debug('GoogleCalendarService: No requests found');
            return;
        }

        try {
            $results = $batch->execute();
        } catch (\Exception $e) {
            $this->logger->warning('GoogleCalendarService: Batch failed: ' . $e->getMessage());
            throw $e;
        }

        $this->processResultsAndPersist($results);

        $this->entityManager->flush();
    }

    /**
     * Build batch of requests and return it with requestCount
     * @param Issue[] $issues
     * @return array
     * @throws Exception
     * @throws DateMalformedStringException
     */
    private function buildBatch(array $issues): array
    {
        $service = new Calendar($this->googleClient);
        $batch = $service->createBatch();
        $requestCount = 0;

        // Fetch existing events to determine if we should insert or patch
        $existingEvents = $this->issueCalendarEventRepository->findBy(['issue' => $issues, 'provider' => 'google']);
        $eventMap = [];
        foreach ($existingEvents as $event) {
            $eventMap[$event->getIssue()->getId()] = $event;
        }

        foreach ($issues as $issue) {
            $event = $this->createGoogleEvent($issue);

            /** @var RequestInterface $request */
            if (isset($eventMap[$issue->getId()])) {
                /** @var IssueCalendarEvent $existingEvent */
                $existingEvent = $eventMap[$issue->getId()];
                $request = $service->events->patch('primary', $existingEvent->getExternalEventId(), $event);

                $body = json_decode((string)$request->getBody(), true);
                if (isset($body['start'])) {
                    $body['start']['dateTime'] = null;
                }
                if (isset($body['end'])) {
                    $body['end']['dateTime'] = null;
                }
                $request = $request->withBody(Utils::streamFor(json_encode($body)));
            } else {
                $request = $service->events->insert('primary', $event);
            }

            $batch->add($request, 'issue_' . $issue->getId());
            ++$requestCount;
        }

        return [
            'requestCount' => $requestCount,
            'batch' => $batch,
        ];
    }

    /**
     * Verify results and update issue event or create it
     * @param array $results
     * @return void
     */
    private function processResultsAndPersist(array $results): void
    {
        /**
         * @var string $key
         * @var \Exception|Calendar\Event $result
         */
        foreach ($results as $key => $result) {
            $this->logger->info("GoogleCalendarService: Processing result with key: $key");

            if (preg_match('/issue_(\d+)/', $key, $matches)) {
                $eventId = (int)$matches[1];
            } else {
                $this->logger->warning("GoogleCalendarService: Could not extract issue ID from key: $key");
                continue;
            }

            if ($result instanceof \Exception) {
                if ($result->getCode() === 404 || $result->getCode() === 410) {
                    $this->logger->warning("GoogleCalendarService: Event $eventId seems to be deleted on Google (404/410). Re-creating.");
                    $result = $this->recreateGoogleEvent($eventId);
                    if (!$result)
                        continue;
                } else {
                    $this->logger->warning("GoogleCalendarService: Failed syncing $eventId. Exception message: " . $result->getMessage());
                    continue;
                }
            } elseif ($result->getStatus() === 'cancelled') {
                $this->logger->warning("GoogleCalendarService: Event $eventId is 'cancelled' on Google. Re-creating.");
                $result = $this->recreateGoogleEvent($eventId);
                if (!$result)
                    continue;
            }

            $issueEvent = $this->issueCalendarEventRepository->findOneBy(['issue' => $eventId, 'provider' => 'google']);
            if (!$issueEvent) {
                $issue = $this->issueRepository->find($eventId);
                if (!$issue) {
                    $this->logger->warning('GoogleCalendarService: Issue not found');
                    throw new NotFoundHttpException('Issue not found');
                }

                $issueEvent = new IssueCalendarEvent()
                    ->setIssue($issue)
                    ->setProvider('google')
                    ->setExternalHtmlLink($result->getHtmlLink());
            }

            $issueEvent->setExternalEventId($result->getId())
                ->setLastSyncedAt(new DateTimeImmutable());

            $this->entityManager->persist($issueEvent);
        }
    }

    private function recreateGoogleEvent(int $issueId): ?Calendar\Event
    {
        $issue = $this->issueRepository->find($issueId);
        if (!$issue) {
            $this->logger->warning("GoogleCalendarService: Issue $issueId not found during re-creation.");
            return null;
        }

        try {
            $service = new Calendar($this->googleClient);
            $event = $this->createGoogleEvent($issue);
            return $service->events->insert('primary', $event);
        } catch (\Exception $e) {
            $this->logger->error("GoogleCalendarService: Failed to re-create event $issueId: " . $e->getMessage());
            return null;
        }
    }

    /**
     * @throws DateMalformedStringException
     */
    private function createGoogleEvent(Issue $issue): Calendar\Event
    {
        return new Calendar\Event([
            'summary' => "{$issue->getKey()} - {$issue->getTitle()}",
            'description' => $issue->getDescription(),
            'start' => new Calendar\EventDateTime([
                'date' => $issue->getStartDate()->format('Y-m-d'),
                'timeZone' => 'UTC',
            ]),
            'end' => new Calendar\EventDateTime([
                'date' => DateTime::createFromInterface($issue->getEndDate())->modify('+1 day')->format('Y-m-d'),
                'timeZone' => 'UTC',
            ]),
            'source' => [
                'title' => 'ProjectCollab',
                'url' => "{$this->urlManager->getFrontendUrl()}/organizations/{$issue->getProject()->getOrganization()->getId()}/projects/{$issue->getProject()->getId()}/issues/{$issue->getId()}",
            ],
        ]);
    }
}
