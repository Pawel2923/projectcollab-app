<?php

namespace App\State\Sprint;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Doctrine\Common\State\RemoveProcessor;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Issue;
use App\Entity\IssueSprint;
use App\Exception\IncorrectProcessorDataException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class IssueSprintProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor    $persistProcessor,
        private RemoveProcessor     $removeProcessor,
        private HubInterface        $hub,
        private SerializerInterface $serializer,
        private LoggerInterface     $logger
    )
    {
    }

    /** @param IssueSprint|object $data
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof IssueSprint) {
            $this->logger->error('IssueSprintProcessor: data is not instance of IssueSprint', [
                'data_instanceof' => $data,
            ]);
            throw new IncorrectProcessorDataException();
        }

        $issue = $data->getIssue();

        if ($operation instanceof Delete) {
            $this->removeProcessor->process($data, $operation, $uriVariables, $context);
            if ($issue) {
                $this->publishMercureUpdateForIssue($issue);
            }

            return null;
        }

        if ($issue) {
            $this->publishMercureUpdateForIssue($issue);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdateForIssue(Issue $issue): void
    {
        $projectId = $issue->getProject()->getId();
        $topic = "/projects/$projectId/issues";

        $json = $this->serializer->serialize($issue, 'jsonld', ['groups' => ['issue:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
