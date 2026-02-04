<?php

namespace App\State\Project;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Exception\AccessDeniedException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\IssueStatus;
use App\Entity\IssueType;
use App\Entity\Organization;
use App\Entity\Project;
use App\Entity\ProjectMember;
use App\Entity\ProjectRole;
use App\Entity\ProjectSequence;
use App\Entity\Resolution;
use App\Entity\User;
use App\Repository\ProjectRoleRepository;
use App\Service\RoleCacheService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class ProjectProcessor implements ProcessorInterface
{
    private const array DEFAULT_ISSUE_STATUSES = [
        'Do zrobienia',
        'W trakcie',
        'Gotowe',
    ];

    private const array DEFAULT_ISSUE_TYPES = [
        'Zadanie',
        'Podzadanie',
        'Błąd',
    ];

    private const array DEFAULT_RESOLUTIONS = [
        'Wdrożone',
        'Porzucone',
        'Duplikat',
        'Nie będzie naprawione',
        'Nie można odtworzyć',
    ];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security               $security,
        private ProjectRoleRepository  $projectRoleRepository,
        private LoggerInterface        $logger,
        private PersistProcessor       $processor,
        private RoleCacheService       $roleCacheService,
        private HubInterface           $hub,
        private SerializerInterface    $serializer
    )
    {
    }

    /**
     * @param Project $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return mixed
     * @throws ExceptionInterface
     * @throws InvalidArgumentException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (
            !$data instanceof Project ||
            !$data->getOrganization() instanceof Organization
        ) {
            return $data;
        }

        /** @var User|null $user */
        $user = $this->security->getUser();

        $role = $this->projectRoleRepository->findOneBy(['value' => "PRODUCT_OWNER"]);

        if (
            !$user instanceof User ||
            !$role instanceof ProjectRole
        ) {
            return $data;
        }

        // Generate abbreviation if not set. If abbreviation is not generated throw exception
        // Name abbreviation is required for other entities like Issue to be created
        if (empty($data->getNameAbbreviation())) {
            $this->logger->debug('ProjectProcessor: Generating new project abbreviation');

            $abbreviation = $this->generateAbbreviation($data->getName());
            $this->logger->debug('ProjectProcessor: Generated abbreviation', [
                'abbreviation' => $abbreviation,
            ]);

            if (empty($abbreviation)) {
                throw new RuntimeException('Project abbreviation could not be generated.');
            }

            $data->setNameAbbreviation($abbreviation);
        }

        $newMember = new ProjectMember();
        $newMember->setMember($user);
        $newMember->setProject($data);
        $newMember->setRole($role);
        $newMember->setIsBlocked(false);

        if (!$this->security->isGranted('PROJECT_CREATE', $data->getOrganization())) {
            throw new AccessDeniedException('You do not have permission to create a project in this organization.');
        }

        $this->createProjectSequence($data);
        $this->entityManager->persist($data);
        $this->entityManager->persist($newMember);

        // Add issue related defaults
        $this->addIssueStatuses($data);
        $this->addIssueTypes($data);
        $this->addResolutions($data);

        // Invalidate memberships cache so creator sees the new project immediately
        $this->roleCacheService->invalidateAllUserMemberships($user->getId());

        $result = $this->processor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($data);

        return $result;
    }

    private function generateAbbreviation(string $name): string
    {
        $this->logger->debug('ProjectProcessor: Generating abbreviation for name', [
            'name' => $name,
        ]);

        $words = preg_split('/\s+/', strtoupper(trim($name)));
        $abbreviation = '';

        if (count($words) > 1) {
            foreach ($words as $word) {
                if (strlen($abbreviation) > 3) {
                    break;
                }
                if (!empty($word)) {
                    $abbreviation .= $word[0];
                }
            }
        } else {
            $word = $words[0] ?? '';
            if (!empty($word)) {
                $abbreviation .= $word[0];
            }
        }

        return $abbreviation;
    }

    private function createProjectSequence(Project $project): ProjectSequence
    {
        $sequence = new ProjectSequence();
        $sequence->setProjectId($project);
        $sequence->setLastIssueNumber(0);
        // Set bidirectional relationship
        if ($project->getProjectSequence() !== $sequence) {
            $project->setProjectSequence($sequence);
        }

        $this->entityManager->persist($sequence);
        return $sequence;
    }

    private function addIssueStatuses(Project $project): void
    {
        foreach (self::DEFAULT_ISSUE_STATUSES as $statusValue) {
            $status = new IssueStatus();
            $status->setValue($statusValue);
            $status->setProject($project);

            $this->entityManager->persist($status);
        }
    }

    private function addIssueTypes(Project $project): void
    {
        foreach (self::DEFAULT_ISSUE_TYPES as $typeValue) {
            $type = new IssueType();
            $type->setValue($typeValue);
            $type->setProject($project);

            $this->entityManager->persist($type);
        }
    }

    private function addResolutions(Project $project): void
    {
        foreach (self::DEFAULT_RESOLUTIONS as $resolutionValue) {
            $resolution = new Resolution();
            $resolution->setValue($resolutionValue);
            $resolution->setProject($project);

            $this->entityManager->persist($resolution);
        }
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Project $project): void
    {
        $topic = '/projects';
        $json = $this->serializer->serialize($project, 'jsonld', ['groups' => ['project:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
