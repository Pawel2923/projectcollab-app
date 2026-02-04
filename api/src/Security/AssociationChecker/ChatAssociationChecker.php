<?php

namespace App\Security\AssociationChecker;

use App\Entity\Chat;
use App\Entity\User;
use App\Repository\ChatRoleRepository;
use App\Service\RoleCacheService;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;

readonly class ChatAssociationChecker implements AssociationCheckerInterface
{
    public function __construct(
        private ChatRoleRepository $chatRoleRepository,
        private RoleCacheService   $roleCacheService,
        private LoggerInterface    $logger,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function isMemberOf(User $user, mixed $associationReference): bool
    {
        $chat = $this->getChat($associationReference);
        if (!$chat) {
            return false;
        }

        // Try to get from cache first
        $memberships = $this->roleCacheService->getUserMemberships($user->getId());
        if (isset($memberships['chats'][$chat->getId()])) {
            return true; // Chat members don't have isBlocked field
        }

        // Fallback to database query
        foreach ($chat->getChatMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $user->getId()) {
                return true;
            }
        }

        return false;
    }

    public function belongsTo(User $user, mixed $associationReference): bool
    {
        $chat = $this->getChat($associationReference);
        if (!$chat) {
            return false;
        }

        $creatorRoles = $this->chatRoleRepository->findBy(['value' => 'CREATOR'], null, 1);
        $creatorRole = $creatorRoles[0] ?? null;
        if (!$creatorRole) {
            $this->logger->warning('ChatAssociationChecker: CREATOR role not found in database');
            return false;
        }

        foreach ($chat->getChatMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $user->getId()) {
                return $member->getRole() && $member->getRole()->getId() === $creatorRole->getId();
            }
        }

        return false;
    }

    public function getMemberFromEntity(int $userId, object $entity): ?object
    {
        $chat = $this->getChat($entity);
        if (!$chat) {
            return null;
        }

        foreach ($chat->getChatMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $userId) {
                return $member;
            }
        }

        return null;
    }

    public function getRoleFromEntity(int $userId, object $entity): ?object
    {
        $chat = $this->getChat($entity);
        if (!$chat) {
            return null;
        }

        // Fallback to database query
        foreach ($chat->getChatMembers() as $member) {
            if ($member->getMember() && $member->getMember()->getId() === $userId) {
                return $member->getRole();
            }
        }

        return null;
    }

    /**
     * Extract Chat entity from various reference types
     */
    private function getChat(mixed $associationReference): ?Chat
    {
        if ($associationReference instanceof Chat) {
            return $associationReference;
        }

        return null;
    }
}
