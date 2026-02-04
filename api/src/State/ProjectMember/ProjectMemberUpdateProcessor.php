<?php

namespace App\State\ProjectMember;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ProjectMember;
use App\Entity\User;
use App\Security\AssociationChecker\OrganizationAssociationChecker;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class ProjectMemberUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface             $persistProcessor,
        private Security                       $security,
        private OrganizationAssociationChecker $organizationAssociationChecker,
        private EntityManagerInterface         $entityManager,
        private LoggerInterface                $logger,
        private HubInterface                   $hub,
        private SerializerInterface            $serializer,
    )
    {
    }

    /**
     * @param ProjectMember $data
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ProjectMember
    {
        if (!$data instanceof ProjectMember) {
            throw new BadRequestHttpException('Invalid data type');
        }

        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        $project = $data->getProject();
        if (!$project) {
            throw new BadRequestHttpException('Project member has no associated project');
        }

        // Check if current user has permission to edit project members
        if (!$this->security->isGranted('PROJECT_EDIT', $project)) {
            $this->logger->warning('ProjectMemberUpdateProcessor: User does not have permission to edit project members', [
                'userId' => $currentUser->getId(),
                'projectId' => $project->getId(),
            ]);
            throw new AccessDeniedHttpException('You do not have permission to update project members');
        }

        // Get the original role to check if it's being changed from CREATOR
        $unitOfWork = $this->entityManager->getUnitOfWork();
        $originalData = $unitOfWork->getOriginalEntityData($data);

        if ($originalData && isset($originalData['role'])) {
            $originalRole = $originalData['role'];
            $newRole = $data->getRole();

            // If changing from CREATOR or PRODUCT_OWNER role, verify user is Organization ADMIN
            if (in_array($originalRole->getValue(), ['CREATOR', 'PRODUCT_OWNER'], true) && !in_array($newRole?->getValue(), ['CREATOR', 'PRODUCT_OWNER'], true)) {
                $organization = $project->getOrganization();
                if ($organization) {
                    $orgRole = $this->organizationAssociationChecker->getRoleFromEntity($currentUser->getId(), $organization);

                    if ($orgRole?->getValue() !== 'ADMIN' && $orgRole?->getValue() !== 'CREATOR') {
                        $this->logger->warning('ProjectMemberUpdateProcessor: User attempted to downgrade CREATOR without org admin permissions', [
                            'userId' => $currentUser->getId(),
                            'projectId' => $project->getId(),
                            'organizationId' => $organization->getId(),
                        ]);
                        throw new AccessDeniedHttpException('Only organization administrators can change CREATOR role');
                    }
                }
            }
        }

        $this->logger->info('ProjectMemberUpdateProcessor: Updating project member role', [
            'userId' => $currentUser->getId(),
            'projectId' => $project->getId(),
            'memberId' => $data->getMember()?->getId(),
            'newRole' => $data->getRole()?->getValue(),
        ]);

        // Persist the changes (this will trigger RoleChangeListener)
        /** @var ProjectMember $result */
        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(ProjectMember $member): void
    {
        if (!$member->getProject()) {
            return;
        }

        $projectId = $member->getProject()->getId();
        $topic = "/project_members?projectId=$projectId";
        $json = $this->serializer->serialize($member, 'jsonld', ['groups' => ['project_member:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
