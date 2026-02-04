<?php

namespace App\Security\Voter;

use App\Entity\Organization;
use App\Entity\OrganizationMember;
use App\Entity\Project;
use App\Entity\ProjectMember;
use App\Entity\User;
use App\Security\AssociationChecker\OrganizationAssociationChecker;
use App\Security\RoleHierarchy;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class ProjectVoter extends Voter
{
    public const string EDIT = 'PROJECT_EDIT';
    public const string VIEW = 'PROJECT_VIEW';
    public const string CREATE = 'PROJECT_CREATE';
    public const string ADMIN = 'PROJECT_ADMIN';

    public function __construct(
        private readonly OrganizationAssociationChecker $associationChecker,
        private readonly RoleHierarchy                  $roleHierarchy,
        private readonly LoggerInterface                $logger,
        private readonly Security                       $security
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if ($attribute === self::CREATE && $subject instanceof Organization) {
            $this->logger->debug('ProjectVoter: Supporting PROJECT_CREATE for Organization', [
                'attribute' => $attribute,
                'organizationId' => $subject->getId(),
            ]);
            return true;
        }

        $supports = in_array($attribute, [self::EDIT, self::VIEW, self::ADMIN], true)
            && $subject instanceof Project;

        $this->logger->debug('ProjectVoter: Checking support', [
            'attribute' => $attribute,
            'subjectType' => is_object($subject) ? get_class($subject) : gettype($subject),
            'supports' => $supports,
        ]);

        return $supports;
    }

    /** @param Project $subject */
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var User|null $user */
        $user = $token->getUser();
        if (!$user instanceof UserInterface) {
            $this->logger->warning('ProjectVoter: No authenticated user found', [
                'attribute' => $attribute,
            ]);
            return false;
        }

        $this->logger->info('ProjectVoter: Voting on attribute', [
            'attribute' => $attribute,
            'userId' => $user->getId(),
            'subjectId' => $subject instanceof Project ? $subject->getId() : ($subject instanceof Organization ? $subject->getId() : null),
        ]);

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('ProjectVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        $result = match ($attribute) {
            self::EDIT, self::VIEW, self::ADMIN => $this->isMemberPermitted($subject, $user, $attribute),
            self::CREATE => $this->associationChecker->belongsTo($user, $subject),
            default => false,
        };

        $this->logger->info('ProjectVoter: Vote result', [
            'attribute' => $attribute,
            'userId' => $user->getId(),
            'result' => $result ? 'GRANTED' : 'DENIED',
        ]);

        return $result;
    }

    /**
     * Check if user is a member of the project with a non-blocked status
     */
    private function isMemberPermitted(Project $subject, User $user, string $attribute): bool
    {
        $this->logger->debug('ProjectVoter: Checking member permissions', [
            'projectId' => $subject->getId(),
            'userId' => $user->getId(),
            'attribute' => $attribute,
        ]);

        $organizationMember = $subject->getOrganization()->getOrganizationMembers()
            ->filter(fn(OrganizationMember $member) => $member->getMember()->getId() === $user->getId())
            ->first();

        if ($organizationMember instanceof OrganizationMember && !$organizationMember->isBlocked()) {
            $orgRole = $organizationMember->getRole()?->getValue();
            $this->logger->debug('ProjectVoter: Found organization membership', [
                'organizationId' => $subject->getOrganization()->getId(),
                'orgRole' => $orgRole,
                'isBlocked' => $organizationMember->isBlocked(),
            ]);

            if ($this->roleHierarchy->hasPermission($orgRole, 'ADMIN')) {
                $this->logger->info('ProjectVoter: Granted access via organization ADMIN/CREATOR role', [
                    'userId' => $user->getId(),
                    'projectId' => $subject->getId(),
                ]);
                return true;
            }
        } else {
            $this->logger->debug('ProjectVoter: User is not an organization member or is blocked', [
                'userId' => $user->getId(),
                'organizationId' => $subject->getOrganization()->getId(),
            ]);
        }

        $member = $subject->getProjectMembers()
            ->filter(fn(ProjectMember $member) => $member->getMember()->getId() === $user->getId())
            ->first();

        if (!$member instanceof ProjectMember || $member->isBlocked()) {
            $this->logger->info('ProjectVoter: User is not a project member or is blocked', [
                'userId' => $user->getId(),
                'projectId' => $subject->getId(),
                'isMember' => $member instanceof ProjectMember,
                'isBlocked' => $member instanceof ProjectMember ? $member->isBlocked() : null,
            ]);
            return false;
        }

        $role = $member->getRole()?->getValue();
        $this->logger->debug('ProjectVoter: Found project membership', [
            'projectId' => $subject->getId(),
            'userId' => $user->getId(),
            'role' => $role,
        ]);

        if (!$role) {
            $this->logger->warning('ProjectVoter: Project member has no role assigned', [
                'userId' => $user->getId(),
                'projectId' => $subject->getId(),
            ]);
            return false;
        }

        // Use role hierarchy for permission checks
        $permitted = match ($attribute) {
            self::ADMIN => $this->roleHierarchy->hasPermission($role, 'ADMIN'),
            self::EDIT => $this->roleHierarchy->hasPermission($role, 'EDITOR'),
            self::VIEW => $this->roleHierarchy->hasPermission($role, 'VIEWER'),
            default => false,
        };

        $this->logger->debug('ProjectVoter: Permission check result via hierarchy', [
            'userId' => $user->getId(),
            'projectId' => $subject->getId(),
            'role' => $role,
            'attribute' => $attribute,
            'permitted' => $permitted,
        ]);

        return $permitted;
    }
}
