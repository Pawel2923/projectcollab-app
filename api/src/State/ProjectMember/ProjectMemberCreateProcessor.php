<?php

namespace App\State\ProjectMember;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ProjectMember;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Repository\ProjectMemberRepository;
use App\Repository\ProjectRoleRepository;
use App\Service\RoleCacheService;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class ProjectMemberCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private Security                $security,
        private ProjectMemberRepository $projectMemberRepository,
        private ProjectRoleRepository   $projectRoleRepository,
        private PersistProcessor        $persistProcessor,
        private LoggerInterface         $logger,
        private RoleCacheService        $roleCacheService,
        private HubInterface            $hub,
        private SerializerInterface     $serializer
    )
    {
    }

    /**
     * @param ProjectMember|object $data
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ProjectMember
    {
        if (!$data instanceof ProjectMember) {
            throw new IncorrectProcessorDataException('ProjectMemberCreateProcessor can only process ProjectMember objects.');
        }

        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        $project = $data->getProject();
        if (!$project) {
            throw new BadRequestHttpException('Project is required');
        }

        $invitedUser = $data->getMember();
        if (!$invitedUser) {
            throw new BadRequestHttpException('Member is required');
        }

        // Check if current user has permission to edit project members
        if (!$this->security->isGranted('PROJECT_EDIT', $project)) {
            $this->logger->warning('ProjectMemberCreateProcessor: User does not have permission to invite project members', [
                'userId' => $currentUser->getId(),
                'projectId' => $project->getId(),
            ]);
            throw new AccessDeniedHttpException('You do not have permission to invite members to this project');
        }

        // Check if invited user is already a member
        $existingMember = $this->projectMemberRepository->findOneBy([
            'project' => $project,
            'member' => $invitedUser,
        ]);

        if ($existingMember) {
            throw new BadRequestHttpException('User is already a member of this project');
        }

        // Set invitedBy to current user
        $data->setInvitedBy($currentUser);

        // Set default role to MEMBER if not specified
        if (!$data->getRole()) {
            $memberRoles = $this->projectRoleRepository->findBy(['value' => 'MEMBER'], null, 1);
            $memberRole = $memberRoles[0] ?? null;
            if (!$memberRole) {
                throw new BadRequestHttpException('Default member role not found');
            }
            $data->setRole($memberRole);
        }

        // Set isBlocked to false by default
        if ($data->isBlocked() === null) {
            $data->setIsBlocked(false);
        }

        $this->logger->info('ProjectMemberCreateProcessor: Inviting user to project', [
            'inviterId' => $currentUser->getId(),
            'projectId' => $project->getId(),
            'invitedUserId' => $invitedUser->getId(),
            'role' => $data->getRole()?->getValue(),
        ]);

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        // Invalidate memberships cache for the invited user so project visibility updates
        $this->roleCacheService->invalidateAllUserMemberships($invitedUser->getId());

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
