<?php

namespace App\State\Issue;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Issue;
use App\Entity\IssueTag;
use App\Entity\Tag;
use App\Exception\IncorrectProcessorDataException;
use App\Service\SoftDelete\IssueSoftDeleteService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class IssueUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor       $processor,
        private EntityManagerInterface $entityManager,
        private LoggerInterface        $logger,
        private IssueSoftDeleteService $issueSoftDeleteService,
        private HubInterface           $hub,
        private SerializerInterface    $serializer
    )
    {
    }

    /**
     * @param Issue|object $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return object
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

        $data->setUpdatedAt(new DateTime());
        $this->updateTags($data);

        if ($data->isArchived()) {
            $this->issueSoftDeleteService->softDelete($data);
        }

        $this->publishMercureUpdate($data);

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    private function updateTags(Issue $data): void
    {
        $request = $context['request'] ?? null;
        $tags = null;

        if ($request?->getContent()) {
            $requestData = json_decode($request->getContent(), true);
            $tags = $requestData['tags'] ?? null;
        }

        if (is_array($tags)) {
            $this->logger->info("[IssueUpdateProcessor] Tags: processing issue tags", [
                'tags' => $tags,
            ]);

            foreach ($data->getIssueTags() as $issueTag) {
                $data->removeIssueTag($issueTag);
            }
            $this->entityManager->flush();

            foreach ($tags as $tagIri) {
                if (is_string($tagIri)) {
                    $tagId = basename($tagIri);
                    $tag = $this->entityManager->getRepository(Tag::class)->find($tagId);

                    if ($tag) {
                        $issueTag = new IssueTag();
                        $issueTag->setTag($tag);
                        $data->addIssueTag($issueTag);
                    } else {
                        $this->logger->error("[IssueUpdateProcessor] Tag not found", [
                            'tagId' => $tagId,
                        ]);
                    }
                }
            }
        }
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
