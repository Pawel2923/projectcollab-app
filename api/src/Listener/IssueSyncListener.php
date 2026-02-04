<?php

namespace App\Listener;

use App\Entity\Issue;
use App\Message\SyncCalendarToProvider;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsDoctrineListener(event: Events::preUpdate)]
#[AsDoctrineListener(event: Events::postUpdate)]
class IssueSyncListener
{
    private array $issuesToSync;

    public function __construct(
        private readonly MessageBusInterface $messageBus,
        private readonly LoggerInterface     $logger
    )
    {
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Issue) {
            return;
        }

        $changes = [];
        if ($args->hasChangedField('title'))
            $changes[] = 'title';
        if ($args->hasChangedField('description'))
            $changes[] = 'description';
        if ($args->hasChangedField('startDate'))
            $changes[] = 'startDate';
        if ($args->hasChangedField('endDate'))
            $changes[] = 'endDate';

        if (!empty($changes)) {
            $this->logger->info('IssueSyncListener: Issue updated with relevant fields, marking for sync', [
                'issueId' => $entity->getId(),
                'changedFields' => $changes
            ]);
            $this->issuesToSync[spl_object_id($entity)] = $entity;
        }
    }

    /**
     * @throws ExceptionInterface
     */
    public function postUpdate(PostUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Issue) {
            return;
        }

        $oid = spl_object_id($entity);
        if (!isset($this->issuesToSync[$oid])) {
            return;
        }

        unset($this->issuesToSync[$oid]);

        $this->logger->info('IssueSyncListener: Processing sync for issue', ['issueId' => $entity->getId()]);

        $usersToSync = [];
        foreach ($entity->getAssignees() as $assignee) {
            $usersToSync[$assignee->getId()] = $assignee;
        }

        if ($reporter = $entity->getReporter()) {
            $usersToSync[$reporter->getId()] = $reporter;
        }

        foreach ($usersToSync as $user) {
            foreach ($user->getOauthAccounts() as $oauthAccount) {
                // Skip users accounts that have never been synced
                if ($oauthAccount->getLastSyncedAt() === null) {
                    continue;
                }

                $provider = $oauthAccount->getProvider();

                if (in_array($provider, ['google', 'microsoft-entra-id'])) {
                    $this->logger->info('IssueSyncListener: Dispatching sync message', [
                        'issueId' => $entity->getId(),
                        'userId' => $user->getId(),
                        'provider' => $provider
                    ]);

                    $this->messageBus->dispatch(new SyncCalendarToProvider(
                        userId: $user->getId(),
                        issueIds: [$entity->getId()],
                        provider: $provider
                    ));
                }
            }
        }
    }
}
