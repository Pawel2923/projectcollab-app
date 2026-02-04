<?php

namespace App\Security\Voter;

use App\Entity\Issue;
use App\Entity\User;
use App\Security\AssociationChecker\ProjectAssociationChecker;
use App\Security\RoleHierarchy;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class IssueVoter extends Voter
{
    public const string EDIT = 'ISSUE_EDIT';
    public const string VIEW = 'ISSUE_VIEW';
    public const string DELETE = 'ISSUE_DELETE';
    public const string CREATE = 'ISSUE_CREATE';

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
            && $subject instanceof Issue;
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

        /** @var Issue $issue */
        $issue = $subject;

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('IssueVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        $project = $issue->getProject();

        if (!$project) {
            $this->logger->warning('IssueVoter: Issue has no associated project', [
                'issueId' => $issue->getId(),
            ]);
            return false;
        }

        // Check if user is a member of the project
        if (!$this->projectAssociationChecker->isMemberOf($user, $project)) {
            $this->logger->info('IssueVoter: User is not a project member', [
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
            $this->logger->warning('IssueVoter: User has no role in project', [
                'userId' => $user->getId(),
                'projectId' => $project->getId(),
            ]);
            return false;
        }

        $this->logger->debug('IssueVoter: Checking permission', [
            'attribute' => $attribute,
            'userRole' => $userRole,
            'issueId' => $issue->getId(),
            'projectId' => $project->getId(),
        ]);

        return match ($attribute) {
            self::VIEW => $this->canView($userRole),
            self::EDIT => $this->canEdit($userRole, $issue, $user),
            self::DELETE => $this->canDelete($userRole),
            self::CREATE => $this->canCreate($userRole),
            default => false,
        };
    }

    private function canView(string $userRole): bool
    {
        // All project members can view issues (VIEWER and above)
        return $this->roleHierarchy->hasPermission($userRole, 'VIEWER');
    }

    private function canEdit(string $userRole, Issue $issue, User $user): bool
    {
        // EDITOR and above can edit all issues
        if ($this->roleHierarchy->hasPermission($userRole, 'EDITOR')) {
            return true;
        }

        // DEVELOPER can edit issues they reported
        if ($this->roleHierarchy->hasPermission($userRole, 'DEVELOPER')) {
            return $issue->getReporter()?->getId() === $user->getId();
        }

        return false;
    }

    private function canDelete(string $userRole): bool
    {
        // Only ADMIN and above can delete issues
        return $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }

    private function canCreate(string $userRole): bool
    {
        // DEVELOPER and above can create issues
        return $this->roleHierarchy->hasPermission($userRole, 'DEVELOPER');
    }
}
