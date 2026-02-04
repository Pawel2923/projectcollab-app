<?php

namespace App\State\OrganizationMember;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Chat;
use App\Entity\ChatMember;
use App\Entity\OrganizationMember;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Repository\ChatRepository;
use App\Repository\ChatRoleRepository;
use App\Repository\OrganizationRoleRepository;
use App\Service\RoleCacheService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class OrganizationMemberCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface     $entityManager,
        private OrganizationRoleRepository $organizationRoleRepository,
        private ChatRepository             $chatRepository,
        private ChatRoleRepository         $chatRoleRepository,
        private PersistProcessor           $persistProcessor,
        private RoleCacheService           $roleCacheService,
        private LoggerInterface            $logger,
        private Security                   $security,
        private HubInterface               $hub,
        private SerializerInterface        $serializer
    )
    {
    }

    /**
     * @param OrganizationMember|object $data
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): OrganizationMember
    {
        if (!$data instanceof OrganizationMember) {
            throw new IncorrectProcessorDataException('OrganizationMemberCreateProcessor can only process OrganizationMember objects.');
        }

        $this->logger->info('OrganizationMemberCreateProcessor: Process Started');

        $data->setIsBlocked(false);
        $this->logger->info('OrganizationMemberCreateProcessor: Setting Role...');
        $roles = $this->organizationRoleRepository->findBy(['value' => 'MEMBER'], null, 1);
        $role = $roles[0] ?? null;
        $data->setRole($role);
        $this->logger->info('OrganizationMemberCreateProcessor: Role Set. Role found: ' . ($role ? 'yes' : 'no'));

        // Set invitedBy to current user
        $currentUser = $this->security->getUser();
        if ($currentUser instanceof User) {
            $data->setInvitedBy($currentUser);
        }

        $organization = $data->getOrganization();
        if ($organization) {
            $generalChats = $this->chatRepository->findBy([
                'organization' => $organization,
                'type' => Chat::TYPE_GENERAL
            ], null, 1);
            $generalChat = $generalChats[0] ?? null;

            if ($generalChat) {
                $memberRoles = $this->chatRoleRepository->findBy(['value' => 'MEMBER'], null, 1);
                $memberRole = $memberRoles[0] ?? null;

                if ($memberRole) {
                    $chatMember = new ChatMember();
                    $chatMember->setChat($generalChat);
                    $chatMember->setMember($data->getMember());
                    $chatMember->setRole($memberRole);
                    $this->entityManager->persist($chatMember);
                }
            }
        }

        // Invalidate memberships cache for the affected user so they see the organization
        if ($data->getMember()) {
            $this->roleCacheService->invalidateAllUserMemberships($data->getMember()->getId());
        }

        $this->logger->info('OrganizationMemberCreateProcessor: About to call persistProcessor');
        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(OrganizationMember $member): void
    {
        if (!$member->getOrganization()) {
            return;
        }

        $orgId = $member->getOrganization()->getId();
        $topic = "/organization_members?organizationId=$orgId";
        $json = $this->serializer->serialize($member, 'jsonld', ['groups' => ['organization_member:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
