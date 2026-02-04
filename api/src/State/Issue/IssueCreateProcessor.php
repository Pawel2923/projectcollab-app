<?php

namespace App\State\Issue;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Issue;
use App\Entity\Project;
use App\Exception\IncorrectProcessorDataException;
use App\Exception\ProjectAbbreviationNotSetException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class IssueCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security               $security,
        private LoggerInterface        $logger,
        private HubInterface           $hub,
        private SerializerInterface    $serializer
    )
    {
    }

    /** @param Issue|object $data
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): object
    {
        if (!$data instanceof Issue) {
            $this->logger->error('IssueProcessor: data is not instance of Issue', [
                'data_instanceof' => $data,
            ]);
            throw new IncorrectProcessorDataException();
        }

        // log all issue fields for debugging
        $this->logger->debug('IssueCreateProcessor: issue data', [
            'issue_data' => [
                'title' => $data->getTitle(),
                'description' => $data->getDescription(),
                'reporter' => $data->getReporter(),
                'project' => $data->getProject(),
                'key' => $data->getKey(),
            ],
        ]);

        $project = $data->getProject();
        if (!$project instanceof Project) {
            throw new IncorrectProcessorDataException('Project is required to create an issue.');
        }

        if (!$data->getReporter()) {
            $this->logger->debug('IssueProcessor: reporter is not set. Setting now.');
            $data->setReporter($this->security->getUser());
        }

        $projectAbbreviation = $project->getNameAbbreviation();
        if (!$projectAbbreviation) {
            $this->logger->error('IssueProcessor: project abbreviation is not set.', [
                'project_abbreviation' => $projectAbbreviation,
            ]);
            throw new ProjectAbbreviationNotSetException();
        }

        $projectSequence = $project->getProjectSequence();
        if (!$projectSequence) {
            $this->logger->error('IssueProcessor: project sequence is not set.', [
                'project_id' => $project->getId(),
            ]);
            throw new \RuntimeException('Project sequence is not initialized for this project.');
        }
        
        $newIssueNumber = $projectSequence->getLastIssueNumber() + 1;

        $projectSequence->setLastIssueNumber($newIssueNumber);

        $key = "$projectAbbreviation-$newIssueNumber";
        $data->setKey($key);

        $this->entityManager->persist($projectSequence);
        $this->entityManager->persist($project);
        $this->entityManager->persist($data);
        $this->entityManager->flush();

        $this->publishMercureUpdate($data);

        $this->logger->debug('IssueProcessor: project sequence set successfully.');
        return $data;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Issue $issue): void
    {
        $project = $issue->getProject();
        if (!$project) {
            return;
        }

        $topic = "/projects/{$project->getId()}/issues";
        $json = $this->serializer->serialize($issue, 'jsonld', ['groups' => ['issue:read']]);

        $update = new Update(
            $topic,
            $json,
            true
        );

        $this->hub->publish($update);
    }
}
