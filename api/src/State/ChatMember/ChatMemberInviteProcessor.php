<?php

namespace App\State\ChatMember;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Chat;
use App\Entity\ChatMember;
use App\Entity\Message;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Repository\ChatMemberRepository;
use App\Repository\ChatRoleRepository;
use App\Repository\OrganizationMemberRepository;
use App\Service\RoleCacheService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class ChatMemberInviteProcessor implements ProcessorInterface
{
    public function __construct(
        private Security                     $security,
        private EntityManagerInterface       $entityManager,
        private ChatMemberRepository         $chatMemberRepository,
        private ChatRoleRepository           $chatRoleRepository,
        private OrganizationMemberRepository $organizationMemberRepository,
        private PersistProcessor             $processor,
        private RoleCacheService             $roleCacheService,
        private HubInterface                 $hub,
        private SerializerInterface          $serializer
    )
    {
    }

    /**
     * @param ChatMember|object $data
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ChatMember
    {
        if (!$data instanceof ChatMember) {
            throw new IncorrectProcessorDataException('ChatMemberInviteProcessor can only process ChatMember objects.');
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedHttpException('You must be logged in to invite members.');
        }

        $chat = $data->getChat();
        if (!$chat) {
            throw new BadRequestHttpException('Chat is required.');
        }

        $invitedUser = $data->getMember();
        if (!$invitedUser) {
            throw new BadRequestHttpException('Member is required.');
        }

        // Check if current user is a member of the chat with appropriate role
        $currentUserChatMembers = $this->chatMemberRepository->findBy([
            'chat' => $chat,
            'member' => $user,
        ], null, 1);
        $currentUserChatMember = $currentUserChatMembers[0] ?? null;

        if (!$currentUserChatMember) {
            throw new AccessDeniedHttpException('You are not a member of this chat.');
        }

        $currentUserRole = $currentUserChatMember->getRole();
        $allowedRoles = ['CREATOR', 'ADMIN', 'MODERATOR'];

        if (!$currentUserRole || !in_array($currentUserRole->getValue(), $allowedRoles)) {
            throw new AccessDeniedHttpException('You do not have permission to invite members to this chat.');
        }

        // Check if invited user is already a member
        $existingMembers = $this->chatMemberRepository->findBy([
            'chat' => $chat,
            'member' => $invitedUser,
        ], null, 1);
        $existingMember = $existingMembers[0] ?? null;

        if ($existingMember) {
            throw new BadRequestHttpException('User is already a member of this chat.');
        }

        // Check if invited user is a member of the organization
        $organization = $chat->getOrganization();
        $isOrgMembers = $this->organizationMemberRepository->findBy([
            'organization' => $organization,
            'member' => $invitedUser
        ], null, 1);
        $isOrgMember = $isOrgMembers[0] ?? null;

        if (!$isOrgMember) {
            throw new BadRequestHttpException('User is not a member of this organization.');
        }

        // Set MEMBER role for the invited user
        $memberRoles = $this->chatRoleRepository->findBy(['value' => 'MEMBER'], null, 1);
        $memberRole = $memberRoles[0] ?? null;
        if (!$memberRole) {
            throw new BadRequestHttpException('Member role not found.');
        }

        $data->setRole($memberRole);
        $result = $this->processor->process($data, $operation, $uriVariables, $context);
        $this->createSystemMessage($chat, $currentUserChatMember, $invitedUser);

        // Invalidate memberships cache for the invited user to reflect new chat membership
        $this->roleCacheService->invalidateAllUserMemberships($invitedUser->getId());

        $this->publishMercureUpdate($chat, $invitedUser);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Chat $chat, User $invitedUser): void
    {
        $topic = sprintf('/users/%d/chats', $invitedUser->getId());
        $json = $this->serializer->serialize($chat, 'jsonld', ['groups' => ['chat:read']]);

        $update = new Update(
            $topic,
            $json,
            true
        );

        $this->hub->publish($update);
    }

    private function createSystemMessage(Chat $chat, ChatMember $inviter, User $invitedUser): void
    {
        $username = $invitedUser->getUsername() ?? $invitedUser->getEmail();
        $messageContent = "@$username dołączył(a) do czatu";

        $systemMessage = new Message();
        $systemMessage->setChat($chat);
        $systemMessage->setSender($inviter);
        $systemMessage->setContent($messageContent);

        $this->entityManager->persist($systemMessage);
        $this->entityManager->flush();
    }
}
