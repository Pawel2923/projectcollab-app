<?php

namespace App\Security\Voter;

use App\Entity\Chat;
use App\Entity\User;
use App\Security\AssociationChecker\ChatAssociationChecker;
use App\Security\RoleHierarchy;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ChatVoter extends Voter
{
    public const string INVITE = 'CHAT_INVITE';
    public const string EDIT = 'CHAT_EDIT';
    public const string DELETE = 'CHAT_DELETE';
    public const string VIEW = 'CHAT_VIEW';

    public function __construct(
        private readonly ChatAssociationChecker $chatAssociationChecker,
        private readonly RoleHierarchy          $roleHierarchy,
        private readonly LoggerInterface        $logger,
        private readonly Security               $security
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::INVITE, self::EDIT, self::DELETE, self::VIEW], true)
            && $subject instanceof Chat;
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

        /** @var Chat $chat */
        $chat = $subject;

        if ($this->security->isGranted('ROLE_ADMIN')) {
            $this->logger->info('ChatVoter: Granted access via ROLE_ADMIN');
            return true;
        }

        // Check if user is a member of the chat
        if (!$this->chatAssociationChecker->isMemberOf($user, $chat)) {
            $this->logger->info('ChatVoter: User is not a chat member', [
                'userId' => $user->getId(),
                'chatId' => $chat->getId(),
                'attribute' => $attribute,
            ]);
            return false;
        }

        // VIEW access is granted if the user is a member of the chat
        if ($attribute === self::VIEW) {
            return true;
        }

        // Get user's role in the chat
        $roleObject = $this->chatAssociationChecker->getRoleFromEntity($user->getId(), $chat);
        $userRole = $roleObject?->getValue();

        if (!$userRole) {
            $this->logger->warning('ChatVoter: User has no role in chat', [
                'userId' => $user->getId(),
                'chatId' => $chat->getId(),
            ]);
            return false;
        }

        $this->logger->debug('ChatVoter: Checking permission', [
            'attribute' => $attribute,
            'userRole' => $userRole,
            'chatId' => $chat->getId(),
        ]);

        return match ($attribute) {
            self::INVITE => $this->canInvite($userRole),
            self::EDIT => $this->canEdit($userRole),
            self::DELETE => $this->canDelete($userRole),
            default => false,
        };
    }

    private function canInvite(string $userRole): bool
    {
        // MODERATOR, ADMIN, CREATOR can invite members
        return $this->roleHierarchy->hasPermission($userRole, 'MODERATOR')
            || $this->roleHierarchy->hasPermission($userRole, 'ADMIN')
            || $this->roleHierarchy->hasPermission($userRole, 'CREATOR');
    }

    private function canEdit(string $userRole): bool
    {
        // ADMIN and CREATOR can edit chat settings
        return $this->roleHierarchy->hasPermission($userRole, 'ADMIN')
            || $this->roleHierarchy->hasPermission($userRole, 'CREATOR');
    }

    private function canDelete(string $userRole): bool
    {
        // Only CREATOR can delete chat
        return $userRole === 'CREATOR';
    }
}
