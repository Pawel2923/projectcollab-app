<?php

namespace App\MessageHandler;

use App\Entity\User;
use App\Message\SyncCalendarToProvider;
use App\Repository\IssueRepository;
use App\Repository\UserOAuthRepository;
use App\Repository\UserRepository;
use App\Service\Calendar\GoogleCalendarService;
use App\Service\Calendar\MicrosoftCalendarService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Throwable;

#[AsMessageHandler]
readonly class SyncCalendarHandler
{
    public function __construct(
        private UserRepository           $userRepository,
        private IssueRepository          $issueRepository,
        private UserOAuthRepository      $userOAuthRepository,
        private GoogleCalendarService    $googleCalendarService,
        private MicrosoftCalendarService $microsoftCalendarService,
        private LoggerInterface          $logger,
        private EntityManagerInterface   $entityManager,
        private HubInterface             $hub,
    )
    {
    }

    public function __invoke(SyncCalendarToProvider $message): void
    {
        $this->logger->info('SyncCalendarHandler: starting calendar sync for user', ['userId' => $message->getUserId(), 'issueIds' => $message->getIssueIds(), 'provider' => $message->getProvider()]);

        $user = $this->userRepository->find($message->getUserId());
        $issues = $this->issueRepository->findBy(['id' => $message->getIssueIds()]);

        if (empty($issues) || !$user) {
            $this->logger->error('SyncCalendarHandler: Sync failed - issues or user not found', [
                'issues_found' => count($issues),
                'user_found' => $user ? 'yes' : 'no'
            ]);
            return;
        }

        $this->logger->info('SyncCalendarHandler: retrieved user and issues, starting service sync');

        try {
            if ($message->getProvider() === 'google') {
                $this->googleCalendarService->syncIssues($user, $issues);
            } elseif ($message->getProvider() === 'microsoft-entra-id') {
                $this->microsoftCalendarService->syncIssues($user, $issues);
            }
            $this->logger->info('SyncCalendarHandler: service sync completed successfully');

            $userOAuth = $this->userOAuthRepository->findOneBy(['user' => $user, 'provider' => $message->getProvider()]);
            if ($userOAuth) {
                $userOAuth->setLastSyncedAt(new DateTime());
                $this->entityManager->flush();

                $this->publishMercureUpdate($user);
            }

        } catch (Throwable $th) {
            $this->logger->error('SyncCalendarHandler: Sync failed with exception', [
                'exception' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
        }
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
