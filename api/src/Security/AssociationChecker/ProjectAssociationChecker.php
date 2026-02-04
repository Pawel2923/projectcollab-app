<?php

namespace App\Security\AssociationChecker;

use App\Entity\Project;
use App\Entity\User;
use App\Repository\ProjectRoleRepository;
use App\Service\RoleCacheService;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;

readonly class ProjectAssociationChecker implements AssociationCheckerInterface
{
    public function __construct(
        private ProjectRoleRepository $projectRoleRepository,
        private RoleCacheService      $roleCacheService,
        private LoggerInterface       $logger,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function isMemberOf(User $user, mixed $associationReference): bool
    {
        $project = $this->getProject($associationReference);
        if (!$project) {
            return false;
        }

        // Try to get from cache first
        $memberships = $this->roleCacheService->getUserMemberships($user->getId());
        if (isset($memberships['projects'][$project->getId()])) {
            $membership = $memberships['projects'][$project->getId()];
            return !($membership['isBlocked'] ?? false);
        }

        // Fallback to database query
        foreach ($project->getProjectMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $user->getId() && !$member->isBlocked()) {
                return true;
            }
        }

        return false;
    }

    public function belongsTo(User $user, mixed $associationReference): bool
    {
        $project = $this->getProject($associationReference);
        if (!$project) {
            return false;
        }

        $creatorRoles = $this->projectRoleRepository->findBy(['value' => 'CREATOR'], null, 1);
        $creatorRole = $creatorRoles[0] ?? null;
        if (!$creatorRole) {
            $this->logger->warning('ProjectAssociationChecker: CREATOR role not found in database');
            return false;
        }

        foreach ($project->getProjectMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $user->getId()) {
                if ($member->isBlocked()) {
                    return false;
                }

                return $member->getRole() && $member->getRole()->getId() === $creatorRole->getId();
            }
        }

        return false;
    }

    public function getMemberFromEntity(int $userId, object $entity): ?object
    {
        $project = $this->getProject($entity);
        if (!$project) {
            return null;
        }

        foreach ($project->getProjectMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $userId) {
                return $member;
            }
        }

        return null;
    }

    public function getRoleFromEntity(int $userId, object $entity): ?object
    {
        $project = $this->getProject($entity);
        if (!$project) {
            return null;
        }

        // Fallback to database query
        foreach ($project->getProjectMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $userId) {
                return $member->getRole();
            }
        }

        return null;
    }

    /**
     * Extract Project entity from various reference types
     */
    private function getProject(mixed $associationReference): ?Project
    {
        if ($associationReference instanceof Project) {
            return $associationReference;
        }

        return null;
    }
}
