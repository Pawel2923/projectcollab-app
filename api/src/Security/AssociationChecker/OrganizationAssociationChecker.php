<?php

namespace App\Security\AssociationChecker;

use App\Entity\Organization;
use App\Entity\Project;
use App\Entity\User;
use App\Repository\OrganizationRepository;
use App\Repository\OrganizationRoleRepository;
use App\Service\RoleCacheService;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;

readonly class OrganizationAssociationChecker implements AssociationCheckerInterface
{
    public function __construct(
        private OrganizationRepository     $organizationRepository,
        private OrganizationRoleRepository $organizationRoleRepository,
        private RoleCacheService           $roleCacheService,
        private LoggerInterface            $logger,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function isMemberOf(User $user, mixed $associationReference): bool
    {
        $organization = $this->getOrganization($associationReference);
        if (!$organization) {
            return false;
        }

        // Try to get from cache first
        $memberships = $this->roleCacheService->getUserMemberships($user->getId());
        if (isset($memberships['organizations'][$organization->getId()])) {
            $membership = $memberships['organizations'][$organization->getId()];
            return !($membership['isBlocked'] ?? false);
        }

        // Fallback to database query
        foreach ($organization->getOrganizationMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $user->getId() && !$member->isBlocked()) {
                return true;
            }
        }

        return false;
    }

    public function belongsTo(User $user, mixed $associationReference): bool
    {
        $this->logger->debug('OrganizationAssociationChecker: Checking belongsTo', [
            'userId' => $user->getId(),
            'associationReferenceType' => get_class($associationReference),
        ]);

        $organization = $this->getOrganization($associationReference);
        if (!$organization) {
            $this->logger->warning('OrganizationAssociationChecker: Organization not found', [
                'userId' => $user->getId(),
            ]);
            return false;
        }

        $this->logger->debug('OrganizationAssociationChecker: Organization found', [
            'organizationId' => $organization->getId(),
            'organizationName' => $organization->getName(),
        ]);

        $creatorRoles = $this->organizationRoleRepository->findBy(['value' => 'CREATOR'], null, 1);
        $creatorRole = $creatorRoles[0] ?? null;
        if (!$creatorRole) {
            $this->logger->error('OrganizationAssociationChecker: CREATOR role not found in database');
            return false;
        }

        $this->logger->debug('OrganizationAssociationChecker: CREATOR role found', [
            'creatorRoleId' => $creatorRole->getId(),
        ]);

        $members = $organization->getOrganizationMembers();
        $this->logger->debug('OrganizationAssociationChecker: Iterating through organization members', [
            'totalMembers' => count($members),
        ]);

        foreach ($members as $member) {
            $memberUser = $member->getMember();
            $this->logger->debug('OrganizationAssociationChecker: Checking member', [
                'memberExists' => $memberUser !== null,
                'memberId' => $memberUser?->getId(),
                'targetUserId' => $user->getId(),
            ]);

            if ($memberUser && $memberUser->getId() === $user->getId()) {
                $this->logger->debug('OrganizationAssociationChecker: Found user in organization', [
                    'userId' => $user->getId(),
                    'organizationId' => $organization->getId(),
                    'isBlocked' => $member->isBlocked(),
                    'roleId' => $member->getRole()?->getId(),
                    'roleValue' => $member->getRole()?->getValue(),
                    'creatorRoleId' => $creatorRole->getId(),
                ]);

                if ($member->isBlocked()) {
                    $this->logger->info('OrganizationAssociationChecker: User is blocked', [
                        'userId' => $user->getId(),
                        'organizationId' => $organization->getId(),
                    ]);
                    return false;
                }

                $hasRole = $member->getRole() && $member->getRole()->getId() === $creatorRole->getId();
                $this->logger->info('OrganizationAssociationChecker: belongsTo result', [
                    'userId' => $user->getId(),
                    'organizationId' => $organization->getId(),
                    'hasCreatorRole' => $hasRole,
                ]);
                return $hasRole;
            }
        }

        $this->logger->info('OrganizationAssociationChecker: User not found in organization', [
            'userId' => $user->getId(),
            'organizationId' => $organization->getId(),
        ]);

        return false;
    }

    public function getMemberFromEntity(int $userId, object $entity): ?object
    {
        $organization = $this->getOrganization($entity);
        if (!$organization) {
            return null;
        }

        foreach ($organization->getOrganizationMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $userId) {
                return $member;
            }
        }

        return null;
    }

    public function getRoleFromEntity(int $userId, object $entity): ?object
    {
        $organization = $this->getOrganization($entity);
        if (!$organization) {
            return null;
        }

        $member = $this->getMemberFromEntity($userId, $organization);
        return $member?->getRole() ?? null;
    }

    private function getOrganization(mixed $associationReference): ?Organization
    {
        if ($associationReference instanceof Organization) {
            return $associationReference;
        }

        if (is_int($associationReference)) {
            return $this->organizationRepository->find($associationReference);
        }

        if ($associationReference instanceof Project) {
            return $associationReference->getOrganization();
        }

        return null;
    }
}
