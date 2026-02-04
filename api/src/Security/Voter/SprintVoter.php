<?php

namespace App\Security\Voter;

use App\Entity\Sprint;
use App\Entity\User;
use App\Security\AssociationChecker\ProjectAssociationChecker;
use App\Security\RoleHierarchy;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class SprintVoter extends Voter
{
    public const string EDIT = 'SPRINT_EDIT';
    public const string VIEW = 'SPRINT_VIEW';
    public const string DELETE = 'SPRINT_DELETE';
    public const string CREATE = 'SPRINT_CREATE';

    public function __construct(
        private readonly ProjectAssociationChecker $projectAssociationChecker,
        private readonly RoleHierarchy             $roleHierarchy,
        private readonly LoggerInterface           $logger,
        private readonly Security                  $security
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE, self::CREATE], true)
            && $subject instanceof Sprint;
    }

    /**
     * @throws InvalidArgumentException
     */
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Sprint $sprint */
        $sprint = $subject;

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('SprintVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        $project = $sprint->getProject();

        if (!$project) {
            $this->logger->warning('SprintVoter: Sprint has no associated project', [
                'sprintId' => $sprint->getId(),
            ]);
            return false;
        }

        // Check if user is a member of the project
        if (!$this->projectAssociationChecker->isMemberOf($user, $project)) {
            $this->logger->info('SprintVoter: User is not a project member', [
                'userId' => $user->getId(),
                'projectId' => $project->getId(),
                'attribute' => $attribute,
            ]);
            return false;
        }

        // Get user's role in the project
        $roleObject = $this->projectAssociationChecker->getRoleFromEntity($user->getId(), $project);
        $userRole = $roleObject?->getValue();

        if (!$userRole) {
            $this->logger->warning('SprintVoter: User has no role in project', [
                'userId' => $user->getId(),
                'projectId' => $project->getId(),
            ]);
            return false;
        }

        $this->logger->debug('SprintVoter: Checking permission', [
            'attribute' => $attribute,
            'userRole' => $userRole,
            'sprintId' => $sprint->getId(),
            'projectId' => $project->getId(),
        ]);

        return match ($attribute) {
            self::VIEW => $this->canView($userRole),
            self::EDIT => $this->canEdit($userRole),
            self::DELETE => $this->canDelete($userRole),
            self::CREATE => $this->canCreate($userRole),
            default => false,
        };
    }

    private function canView(string $userRole): bool
    {
        // All project members can view sprints (VIEWER and above)
        return $this->roleHierarchy->hasPermission($userRole, 'VIEWER');
    }

    private function canEdit(string $userRole): bool
    {
        // SCRUM_MASTER, PRODUCT_OWNER, ADMIN and above can edit sprints
        return $this->roleHierarchy->hasPermission($userRole, 'SCRUM_MASTER')
            || $this->roleHierarchy->hasPermission($userRole, 'PRODUCT_OWNER')
            || $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }

    private function canDelete(string $userRole): bool
    {
        // Only ADMIN and above can delete sprints
        return $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }

    private function canCreate(string $userRole): bool
    {
        // SCRUM_MASTER, PRODUCT_OWNER, ADMIN and above can create sprints
        return $this->roleHierarchy->hasPermission($userRole, 'SCRUM_MASTER')
            || $this->roleHierarchy->hasPermission($userRole, 'PRODUCT_OWNER')
            || $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }
}
