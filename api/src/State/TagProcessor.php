<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Issue;
use App\Entity\IssueTag;
use App\Entity\Tag;
use App\Exception\IncorrectProcessorDataException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

readonly class TagProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor       $processor,
        private EntityManagerInterface $entityManager,
        private LoggerInterface        $logger
    )
    {
    }

    /** @param Tag|object $data */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Tag
    {
        if (!$data instanceof Tag) {
            throw new IncorrectProcessorDataException('Data must be an instance of Tag');
        }

        $this->linkTagToIssue($data, $data->getIssue());
        $this->setDefaultColors($data);

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    private function linkTagToIssue(Tag $tag, ?Issue $issue): void
    {
        if (!$issue) {
            throw new IncorrectProcessorDataException('Issue is required');
        }

        $this->logger->debug("[TagProcessor]: Linking tag {$tag->getTitle()} to issue {$issue->getId()}", [
            'tag' => $tag,
            'issue' => $issue
        ]);

        $issueTag = new IssueTag();
        $issueTag->setIssue($issue);
        $issueTag->setTag($tag);

        $tag->addIssueTag($issueTag);

        $this->entityManager->persist($issueTag);
    }

    private function setDefaultColors(Tag $tag): void
    {
        if (!empty($tag->getBackgroundColor())) {
            return;
        }

        $this->logger->debug("[TagProcessor]: Setting default colors for tag {$tag->getId()}", [
            'tag' => $tag
        ]);

        $tag->setBackgroundColor('#E0E0E0');
        $tag->setTextColor('#000000');
    }
}
