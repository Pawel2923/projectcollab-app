<?php

namespace App\Security\Voter;

use App\Entity\Organization;
use App\Entity\OrganizationMember;
use App\Entity\User;
use App\Security\RoleHierarchy;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class OrganizationVoter extends Voter
{
    public const string EDIT = 'ORGANIZATION_EDIT';
    public const string ADMIN = 'ORGANIZATION_ADMIN';
    public const string VIEW = 'ORGANIZATION_VIEW';

    public function __construct(
        private readonly RoleHierarchy   $roleHierarchy,
        private readonly LoggerInterface $logger,
        private readonly Security        $security
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        $supports = in_array($attribute, [self::EDIT, self::ADMIN, self::VIEW], true)
            && $subject instanceof Organization;

        $this->logger->debug('OrganizationVoter: Checking support', [
            'attribute' => $attribute,
            'subjectType' => is_object($subject) ? get_class($subject) : gettype($subject),
            'supports' => $supports,
        ]);

        return $supports;
    }

    /** @param Organization $subject */
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var User|null $user */
        $user = $token->getUser();
        if (!$user instanceof UserInterface) {
            $this->logger->warning('OrganizationVoter: No authenticated user found', [
                'attribute' => $attribute,
            ]);
            return false;
        }

        $this->logger->info('OrganizationVoter: Voting on attribute', [
            'attribute' => $attribute,
            'userId' => $user->getId(),
            'userEmail' => $user->getEmail(),
            'organizationId' => $subject->getId(),
        ]);

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('OrganizationVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        $result = match ($attribute) {
            self::EDIT, self::ADMIN, self::VIEW => $this->isMemberPermitted($subject, $user, $attribute),
            default => false,
        };

        $this->logger->info('OrganizationVoter: Vote result', [
            'attribute' => $attribute,
            'userId' => $user->getId(),
            'organizationId' => $subject->getId(),
            'result' => $result ? 'GRANTED' : 'DENIED',
        ]);

        return $result;
    }

    /**
     * Check if user is a member of the organization with required permissions
     */
    private function isMemberPermitted(Organization $subject, User $user, string $attribute): bool
    {
        $this->logger->debug('OrganizationVoter: Checking member permissions', [
            'organizationId' => $subject->getId(),
            'userId' => $user->getId(),
            'attribute' => $attribute,
        ]);

        $members = $subject->getOrganizationMembers();

        $member = $members->filter(fn(OrganizationMember $member) => $member->getMember()->getId() === $user->getId())
            ->first();

        if (!$member instanceof OrganizationMember) {
            $this->logger->info('OrganizationVoter: User is not an organization member', [
                'userId' => $user->getId(),
                'organizationId' => $subject->getId(),
            ]);
            return false;
        }

        if ($member->isBlocked()) {
            $this->logger->info('OrganizationVoter: User is blocked in organization', [
                'userId' => $user->getId(),
                'organizationId' => $subject->getId(),
            ]);
            return false;
        }

        $role = $member->getRole()?->getValue();
        $this->logger->debug('OrganizationVoter: Found organization membership', [
            'organizationId' => $subject->getId(),
            'userId' => $user->getId(),
            'role' => $role,
        ]);

        if (!$role) {
            $this->logger->warning('OrganizationVoter: Organization member has no role assigned', [
                'userId' => $user->getId(),
                'organizationId' => $subject->getId(),
            ]);
            return false;
        }

        // Use role hierarchy for permission checks
        $permitted = match ($attribute) {
            self::EDIT => $this->roleHierarchy->hasPermission($role, 'EDITOR'),
            self::ADMIN => $this->roleHierarchy->hasPermission($role, 'ADMIN'),
            self::VIEW => $this->roleHierarchy->hasPermission($role, 'MEMBER'),
            default => false,
        };

        $this->logger->debug('OrganizationVoter: Permission check result via hierarchy', [
            'userId' => $user->getId(),
            'organizationId' => $subject->getId(),
            'role' => $role,
            'attribute' => $attribute,
            'permitted' => $permitted,
        ]);

        return $permitted;
    }
}
