<?php

namespace App\Listener;

use App\Entity\ChatMember;
use App\Entity\OrganizationMember;
use App\Entity\ProjectMember;
use App\Service\RoleCacheService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostRemoveEventArgs;
use Doctrine\ORM\Events;
use Psr\Cache\InvalidArgumentException;

#[AsEntityListener(event: Events::postRemove, entity: OrganizationMember::class)]
#[AsEntityListener(event: Events::postRemove, entity: ProjectMember::class)]
#[AsEntityListener(event: Events::postRemove, entity: ChatMember::class)]
readonly class MembershipDeleteListener
{
    public function __construct(
        private RoleCacheService $roleCacheService,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function postRemove(OrganizationMember|ProjectMember|ChatMember $entity, PostRemoveEventArgs $event): void
    {
        $memberId = $entity->getMember()?->getId();
        if ($memberId) {
            $this->roleCacheService->invalidateAllUserMemberships($memberId);
        }
    }
}
