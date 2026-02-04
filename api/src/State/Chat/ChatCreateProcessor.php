<?php

namespace App\State\Chat;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Chat;
use App\Entity\ChatMember;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
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

readonly class ChatCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private Security                     $security,
        private EntityManagerInterface       $entityManager,
        private ChatRoleRepository           $chatRoleRepository,
        private OrganizationMemberRepository $organizationMemberRepository,
        private PersistProcessor             $persistProcessor,
        private RoleCacheService             $roleCacheService,
        private HubInterface                 $hub,
        private SerializerInterface          $serializer
    )
    {
    }

    /**
     * @param Chat|object $data
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Chat
    {
        if (!$data instanceof Chat) {
            throw new IncorrectProcessorDataException('ChatCreateProcessor can only process Chat objects.');
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedHttpException('You must be logged in to create a chat.');
        }

        $organization = $data->getOrganization();
        if (!$organization) {
            throw new BadRequestHttpException('Organization is required.');
        }

        $orgMember = $this->organizationMemberRepository->findOneBy([
            'organization' => $organization,
            'member' => $user
        ]);

        if (!$orgMember) {
            throw new AccessDeniedHttpException('You are not a member of this organization.');
        }

        $ownerRole = $this->chatRoleRepository->findOneBy(['value' => 'CREATOR']);
        if (!$ownerRole) {
            throw new BadRequestHttpException('Owner role not found.');
        }

        $chatMember = new ChatMember();
        $chatMember->setChat($data);
        $chatMember->setMember($user);
        $chatMember->setRole($ownerRole);

        $this->entityManager->persist($chatMember);
        $data->addChatMember($chatMember);

        if (!empty($data->initialMembers)) {
            $this->handleInitialMembers($data, $user);
        }

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        // Invalidate memberships cache for creator and any initial members added
        $this->roleCacheService->invalidateAllUserMemberships($user->getId());
        foreach ($data->getChatMembers() as $cm) {
            if ($cm->getMember() && $cm->getMember()->getId() !== $user->getId()) {
                $this->roleCacheService->invalidateAllUserMemberships($cm->getMember()->getId());
            }
        }

        $this->publishMercureUpdates($result);

        return $result;
    }


    private function handleInitialMembers(Chat $chat, User $user): void
    {
        $memberRole = $this->chatRoleRepository->findOneBy(['value' => 'MEMBER']);
        foreach ($chat->getInitialMembers() as $initialMemberEmail) {
            if ($initialMemberEmail === $user->getEmail()) {
                continue;
            }

            $memberUser = $this->entityManager
                ->getRepository(User::class)
                ->findOneBy(['email' => $initialMemberEmail]);

            if (!$memberUser) {
                continue;
            }

            $isOrgMember = $this->organizationMemberRepository->findOneBy([
                'organization' => $chat->getOrganization(),
                'member' => $memberUser
            ]);

            if ($isOrgMember) {
                $newMember = new ChatMember();
                $newMember->setChat($chat);
                $newMember->setMember($memberUser);
                $newMember->setRole($memberRole);

                $this->entityManager->persist($newMember);
                $chat->addChatMember($newMember);
            }
        }
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdates(Chat $chat): void
    {
        foreach ($chat->getChatMembers() as $chatMember) {
            $member = $chatMember->getMember();
            if (!$member) {
                continue;
            }

            $topic = sprintf('/users/%d/chats', $member->getId());
            $json = $this->serializer->serialize($chat, 'jsonld', ['groups' => ['chat:read']]);

            $update = new Update(
                $topic,
                $json,
                true
            );

            $this->hub->publish($update);
        }
    }
}
