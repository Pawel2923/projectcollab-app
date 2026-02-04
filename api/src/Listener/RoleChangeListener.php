<?php

namespace App\Listener;

use App\Entity\ChatMember;
use App\Entity\OrganizationMember;
use App\Entity\ProjectMember;
use App\Entity\RoleChangeLog;
use App\Entity\User;
use App\Service\RoleCacheService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Events;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;

#[AsEntityListener(event: Events::postUpdate, entity: OrganizationMember::class)]
#[AsEntityListener(event: Events::postUpdate, entity: ProjectMember::class)]
#[AsEntityListener(event: Events::postUpdate, entity: ChatMember::class)]
readonly class RoleChangeListener
{
    public function __construct(
        private Security         $security,
        private RoleCacheService $roleCacheService,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function postUpdate(OrganizationMember|ProjectMember|ChatMember $entity, PostUpdateEventArgs $event): void
    {
        $entityManager = $event->getObjectManager();
        $changeSet = $entityManager->getUnitOfWork()->getEntityChangeSet($entity);

        // Check if the role field was changed
        if (!isset($changeSet['role'])) {
            return;
        }

        [$oldRole, $newRole] = $changeSet['role'];

        /** @var ?User $currentUser */
        $currentUser = $this->security->getUser();
        if (!$currentUser) {
            return;
        }

        // Determine entity type and ID
        $entityType = match (true) {
            $entity instanceof OrganizationMember => 'organization',
            $entity instanceof ProjectMember => 'project',
            $entity instanceof ChatMember => 'chat',
            default => null,
        };

        if (!$entityType) {
            return;
        }

        // Get the entity ID
        $entityId = match (true) {
            $entity instanceof OrganizationMember => $entity->getOrganization()?->getId(),
            $entity instanceof ProjectMember => $entity->getProject()?->getId(),
            $entity instanceof ChatMember => $entity->getChat()?->getId(),
            default => null,
        };

        if (!$entityId) {
            return;
        }

        // Create audit log entry
        $log = new RoleChangeLog();
        $log->setEntityType($entityType);
        $log->setEntityId($entityId);
        $log->setMember($entity->getMember());
        $log->setOldRole($oldRole?->getValue());
        $log->setNewRole($newRole?->getValue());
        $log->setChangedBy($currentUser);

        $entityManager->persist($log);
        $entityManager->flush();

        // Invalidate user's membership cache
        $memberId = $entity->getMember()?->getId();
        if ($memberId) {
            $this->roleCacheService->invalidateAllUserMemberships($memberId);
        }
    }
}
