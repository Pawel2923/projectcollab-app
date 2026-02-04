<?php

namespace App\Security\Voter;

use App\Entity\Comment;
use App\Entity\User;
use App\Security\AssociationChecker\ProjectAssociationChecker;
use App\Security\RoleHierarchy;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class CommentVoter extends Voter
{
    public const string EDIT = 'COMMENT_EDIT';
    public const string DELETE = 'COMMENT_DELETE';
    public const string VIEW = 'COMMENT_VIEW';

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
        return in_array($attribute, [self::EDIT, self::DELETE, self::VIEW], true)
            && $subject instanceof Comment;
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

        /** @var Comment $comment */
        $comment = $subject;

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('CommentVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        $issue = $comment->getIssue();

        if (!$issue) {
            $this->logger->warning('CommentVoter: Comment has no associated issue', [
                'commentId' => $comment->getId(),
            ]);
            return false;
        }

        $project = $issue->getProject();

        if (!$project) {
            $this->logger->warning('CommentVoter: Issue has no associated project', [
                'issueId' => $issue->getId(),
            ]);
            return false;
        }

        // Check if user is a member of the project
        if (!$this->projectAssociationChecker->isMemberOf($user, $project)) {
            $this->logger->info('CommentVoter: User is not a project member', [
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
            $this->logger->warning('CommentVoter: User has no role in project', [
                'userId' => $user->getId(),
                'projectId' => $project->getId(),
            ]);
            return false;
        }

        $this->logger->debug('CommentVoter: Checking permission', [
            'attribute' => $attribute,
            'userRole' => $userRole,
            'commentId' => $comment->getId(),
            'projectId' => $project->getId(),
        ]);

        return match ($attribute) {
            self::VIEW => $this->canView($userRole),
            self::EDIT => $this->canEdit($userRole, $comment, $user),
            self::DELETE => $this->canDelete($userRole, $comment, $user),
            default => false,
        };
    }

    private function canView(string $userRole): bool
    {
        // All project members can view comments
        return $this->roleHierarchy->hasPermission($userRole, 'VIEWER');
    }

    private function canEdit(string $userRole, Comment $comment, User $user): bool
    {
        // Users can edit their own comments
        if ($comment->getCommenter()?->getId() === $user->getId()) {
            return true;
        }

        // ADMIN and above can edit any comment
        return $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }

    private function canDelete(string $userRole, Comment $comment, User $user): bool
    {
        // Users can delete their own comments
        if ($comment->getCommenter()?->getId() === $user->getId()) {
            return true;
        }

        // ADMIN and above can delete any comment
        return $this->roleHierarchy->hasPermission($userRole, 'ADMIN');
    }
}
