<?php

namespace App\State;

use ApiPlatform\Metadata\Exception\AccessDeniedException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\CalendarSyncRequest;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Repository\IssueRepository;
use App\Repository\UserOAuthRepository;
use App\Service\Calendar\GoogleCalendarService;
use App\Service\Calendar\MicrosoftCalendarService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

readonly class CalendarSyncProcessor implements ProcessorInterface
{
    public function __construct(
        private Security                 $security,
        private IssueRepository          $issueRepository,
        private UserOAuthRepository      $userOAuthRepository,
        private GoogleCalendarService    $googleCalendarService,
        private MicrosoftCalendarService $microsoftCalendarService,
        private EntityManagerInterface   $entityManager,
        private HubInterface             $hub,
    )
    {
    }

    /**
     * @param mixed $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return CalendarSyncRequest
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     * @throws Exception
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): CalendarSyncRequest
    {
        if (!$data instanceof CalendarSyncRequest) {
            throw new IncorrectProcessorDataException();
        }

        /** @var ?User $user */
        $user = $this->security->getUser();
        if (!$user) {
            throw new AccessDeniedException();
        }

        $issues = $this->issueRepository->findBy(['id' => $data->getIssueIds()]);

        if ($data->getProvider() === 'google') {
            $this->googleCalendarService->syncIssues($user, $issues);
        } elseif ($data->getProvider() === 'microsoft-entra-id') {
            $this->microsoftCalendarService->syncIssues($user, $issues);
        } else {
            throw new InvalidArgumentException("Unsupported provider");
        }

        $userOAuth = $this->userOAuthRepository->findOneBy(['user' => $user, 'provider' => $data->getProvider()]);

        $now = new DateTime();
        if ($userOAuth) {
            $userOAuth->setLastSyncedAt($now);
            $this->entityManager->persist($userOAuth);
            $this->entityManager->flush();

            $this->publishMercureUpdate($user);
        }

        $data->setMessage("Synchronizacja zakończona pomyślnie");
        $data->setLastSyncedAt($now);

        return $data;
    }

    private function publishMercureUpdate(User $user): void
    {
        $topic = "/users/{$user->getId()}/oauth";

        $update = new Update(
            $topic,
            json_encode(['status' => 'updated']),
            true
        );

        $this->hub->publish($update);
    }
}
