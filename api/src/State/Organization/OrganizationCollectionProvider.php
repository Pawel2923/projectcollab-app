<?php

namespace App\State\Organization;

use ApiPlatform\Doctrine\Orm\State\CollectionProvider;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Security\RoleHierarchy;
use App\Service\RoleCacheService;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

readonly class OrganizationCollectionProvider implements ProviderInterface
{
    public function __construct(
        private CollectionProvider $collectionProvider,
        private Security           $security,
        private RoleCacheService   $roleCacheService,
        private RoleHierarchy      $roleHierarchy
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array|null|object
    {
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return [];
        }

        $minRole = $context['filters']['minRole'] ?? null;

        if ($minRole === null) {
            return $this->collectionProvider->provide($operation, $uriVariables, $context);
        }

        // Validate minRole if provided
        $validRoles = $this->roleHierarchy->getAvailableRoles('organization');
        if (!in_array($minRole, $validRoles, true)) {
            throw new BadRequestHttpException(
                sprintf(
                    'Invalid minRole value. Must be one of: %s',
                    implode(', ', $validRoles)
                )
            );
        }

        // Get cached memberships for the user to filter by role
        $memberships = $this->roleCacheService->getUserMemberships($user->getId());
        $organizationMemberships = $memberships['organizations'] ?? [];

        if (empty($organizationMemberships)) {
            return [];
        }

        // Filter organizations by role
        $accessibleOrganizationIds = [];
        foreach ($organizationMemberships as $orgId => $membership) {
            if ($membership['isBlocked']) {
                continue;
            }

            $userRole = $membership['role'];
            if (!$userRole) {
                continue;
            }

            if (!$this->roleHierarchy->hasPermission($userRole, $minRole)) {
                continue;
            }

            $accessibleOrganizationIds[] = $orgId;
        }

        if (empty($accessibleOrganizationIds)) {
            return [];
        }

        // Pass filtered IDs to the default collection provider
        $context['filters']['id'] = $accessibleOrganizationIds;

        return iterator_to_array($this->collectionProvider->provide($operation, $uriVariables, $context));
    }
}
