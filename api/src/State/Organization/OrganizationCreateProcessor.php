<?php

namespace App\State\Organization;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Chat;
use App\Entity\ChatMember;
use App\Entity\Organization;
use App\Entity\OrganizationMember;
use App\Entity\OrganizationRole;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Repository\ChatRoleRepository;
use App\Repository\OrganizationRoleRepository;
use App\Service\RoleCacheService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class OrganizationCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface     $entityManager,
        private Security                   $security,
        private OrganizationRoleRepository $organizationRoleRepository,
        private ChatRoleRepository         $chatRoleRepository,
        private RoleCacheService           $roleCacheService,
        private HubInterface               $hub,
        private SerializerInterface        $serializer
    )
    {
    }

    /** @param Organization|object $data
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Organization
    {
        if (!$data instanceof Organization) {
            throw new IncorrectProcessorDataException('OrganizationCreateProcessor can only process Organization objects.');
        }

        /** @var User|null $user */
        $user = $this->security->getUser();

        $creatorRoles = $this->organizationRoleRepository->findBy(['value' => 'CREATOR'], null, 1);
        $creatorRole = $creatorRoles[0] ?? null;

        if (!$user instanceof User || !$creatorRole instanceof OrganizationRole) {
            throw new AccessDeniedHttpException('You must be logged in to create an organization.');
        }

        $this->entityManager->persist($data);

        $chat = new Chat();
        $chat->setName('Ogólny');
        $chat->setType(Chat::TYPE_GENERAL);
        $chat->setOrganization($data);
        $this->entityManager->persist($chat);

        $newMember = new OrganizationMember();
        $newMember->setMember($user);
        $newMember->setOrganization($data);
        $newMember->setRole($creatorRole);
        $newMember->setIsBlocked(false);

        $this->entityManager->persist($newMember);

        // Add creator to Ogólny chat
        $chatOwnerRoles = $this->chatRoleRepository->findBy(['value' => 'CREATOR'], null, 1);
        $chatOwnerRole = $chatOwnerRoles[0] ?? null;
        if ($chatOwnerRole) {
            $chatMember = new ChatMember();
            $chatMember->setChat($chat);
            $chatMember->setMember($user);
            $chatMember->setRole($chatOwnerRole);
            $this->entityManager->persist($chatMember);
        }

        $this->entityManager->flush();

        // Invalidate membership cache so creator sees the organization immediately
        $this->roleCacheService->invalidateAllUserMemberships($user->getId());

        $this->publishMercureUpdate($data);

        return $data;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Organization $organization): void
    {
        $topic = '/organizations';
        $json = $this->serializer->serialize($organization, 'jsonld', ['groups' => ['organization:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
