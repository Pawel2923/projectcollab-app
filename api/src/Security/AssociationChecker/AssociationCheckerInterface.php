<?php

namespace App\Security\AssociationChecker;

use App\Entity\User;

interface AssociationCheckerInterface
{
    /**
     * Check if the user is a member of the entity referenced by the associationReference.
     *
     * @param User $user The user to check membership for.
     * @param mixed $associationReference The reference to the associated entity (e.g., an entity instance or identifier).
     * @return bool True if the user is a member of the associated entity, false otherwise.
     */
    public function isMemberOf(User $user, mixed $associationReference): bool;

    /**
     * Check if the entity referenced by the associationReference belongs to the user.
     *
     * @param User $user The user to check ownership for.
     * @param mixed $associationReference The reference to the associated entity (e.g., an entity instance or identifier).
     * @return bool True if the associated entity belongs to the user, false otherwise.
     */
    public function belongsTo(User $user, mixed $associationReference): bool;

    /**
     * Retrieve the member with user associated with the given entity.
     *
     * @param int $userId The ID of the user to match.
     * @param object $entity The entity from which to retrieve the member.
     * @return object|null The member associated with the entity, or null if not found.
     */
    public function getMemberFromEntity(int $userId, object $entity): ?object;

    /**
     * Retrieve the role of member associated with the given entity.
     *
     * @param int $userId The ID of the user to match.
     * @param object $entity The entity from which to retrieve the role.
     * @return object|null The role associated with the entity, or null if not found.
     */
    public function getRoleFromEntity(int $userId, object $entity): ?object;
}
