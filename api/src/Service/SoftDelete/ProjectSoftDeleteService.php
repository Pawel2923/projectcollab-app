<?php

namespace App\Service\SoftDelete;

use App\Entity\Issue;
use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements SoftDeleteInterface<Project>
 */
readonly class ProjectSoftDeleteService implements SoftDeleteInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    )
    {
    }

    /**
     * @inheritDoc
     */
    public function softDelete(object $entity): void
    {
        assert($entity instanceof Project);

        $entity->setIsArchived(true);

        foreach ($entity->getIssues() as $issue) {
            $this->softDeleteIssue($issue);
        }

        foreach ($entity->getSprints() as $sprint) {
            $sprint->setIsArchived(true);
        }
    }

    private function softDeleteIssue(Issue $issue): void
    {
        $issue->setIsArchived(true);

        foreach ($issue->getComments() as $comment) {
            $comment->setIsArchived(true);
        }

        foreach ($issue->getAttachments() as $attachment) {
            $this->entityManager->remove($attachment);
        }
    }
}
