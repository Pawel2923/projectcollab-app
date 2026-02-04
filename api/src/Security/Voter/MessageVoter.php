<?php

namespace App\Security\Voter;

use App\Entity\Message;
use App\Entity\User;
use App\Repository\OrganizationMemberRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class MessageVoter extends Voter
{
    public const string DELETE = 'MESSAGE_DELETE';
    public const string EDIT = 'MESSAGE_EDIT';
    public const string VIEW = 'MESSAGE_VIEW';

    public function __construct(
        private readonly OrganizationMemberRepository $organizationMemberRepository,
        private readonly Security $security
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::DELETE, self::EDIT, self::VIEW]) && $subject instanceof Message;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        if ($this->security->isGranted('ROLE_ADMIN')) {
            return true;
        }

        /** @var Message $message */
        $message = $subject;
        $chat = $message->getChat();

        if (!$chat) {
            return false;
        }

        // For viewing, user must have access to the chat
        if ($attribute === self::VIEW) {
            return $this->security->isGranted('CHAT_VIEW', $chat);
        }

        // For other actions, ensure they can at least view the chat first
        if (!$this->security->isGranted('CHAT_VIEW', $chat)) {
            return false;
        }

        if ($attribute === self::EDIT) {
            // User can edit (soft delete) their own message
            return $message->getSender()->getMember() === $user;
        }

        if ($attribute === self::DELETE) {
            // Check if user is admin in the organization
            $organization = $chat->getOrganization();
            if (!$organization) {
                return false;
            }

            $members = $this->organizationMemberRepository->findBy([
                'member' => $user,
                'organization' => $organization,
            ], null, 1);
            $member = $members[0] ?? null;

            if (!$member) {
                return false;
            }

            $role = $member->getRole();
            if (!$role) {
                return false;
            }

            // Assuming 'ADMIN', 'OWNER', 'CREATOR' have permission
            // Adjust these values based on actual Role values in database
            $privilegedRoles = ['ADMIN', 'OWNER', 'CREATOR'];

            return in_array($role->getValue(), $privilegedRoles, true);
        }

        return false;
    }
}
