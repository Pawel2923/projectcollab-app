<?php

namespace App\Security;

readonly class RoleHierarchy
{
    /**
     * Define role inheritance hierarchy
     * Each role inherits permissions from roles in its array
     */
    private const array HIERARCHY = [
        'CREATOR' => ['PRODUCT_OWNER', 'ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER'],
        'PRODUCT_OWNER' => ['CREATOR', 'ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER'],
        'ADMIN' => ['SCRUM_MASTER', 'DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER'],
        'SCRUM_MASTER' => ['DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER'],
        'DEVELOPER' => ['EDITOR', 'MEMBER', 'VIEWER'],
        'EDITOR' => ['MEMBER', 'VIEWER'],
        'MEMBER' => ['VIEWER'],
        'VIEWER' => [],
        // Chat-specific roles
        'MODERATOR' => ['MEMBER'],
    ];

    /**
     * Check if user's role has the required permission level
     *
     * @param string $userRole The role the user has
     * @param string $requiredRole The role required for the action
     * @return bool True if user's role satisfies the requirement
     */
    public function hasPermission(string $userRole, string $requiredRole): bool
    {
        // Direct match
        if ($userRole === $requiredRole) {
            return true;
        }

        // Check if userRole inherits requiredRole
        if (isset(self::HIERARCHY[$userRole])) {
            return in_array($requiredRole, self::HIERARCHY[$userRole], true);
        }

        return false;
    }

    /**
     * Get all roles inherited by the given role
     *
     * @param string $role The role to get inheritance for
     * @return array Array of inherited role names
     */
    public function getInheritedRoles(string $role): array
    {
        return self::HIERARCHY[$role] ?? [];
    }

    /**
     * Get all available roles for a given entity type
     *
     * @param string $entityType 'project', 'organization', or 'chat'
     * @return array Array of role names
     */
    public function getAvailableRoles(string $entityType): array
    {
        return match ($entityType) {
            'project' => ['CREATOR', 'ADMIN', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'EDITOR', 'MEMBER', 'VIEWER'],
            'organization' => ['CREATOR', 'ADMIN', 'MEMBER'],
            'chat' => ['CREATOR', 'ADMIN', 'MODERATOR', 'MEMBER'],
            default => [],
        };
    }
}
