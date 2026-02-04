<?php

namespace App\Service\SoftDelete;

use App\Entity\Chat;
use App\Entity\Issue;
use App\Entity\Organization;
use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements SoftDeleteInterface<Organization>
 */
readonly class OrganizationSoftDeleteService implements SoftDeleteInterface
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
        assert($entity instanceof Organization);

        $entity->setIsArchived(true);

        foreach ($entity->getProjects() as $project) {
            $this->softDeleteProject($project);
        }

        foreach ($entity->getChats() as $chat) {
            $this->softDeleteChat($chat);
        }
    }

    private function softDeleteProject(Project $project): void
    {
        $project->setIsArchived(true);

        foreach ($project->getIssues() as $issue) {
            $this->softDeleteIssue($issue);
        }

        foreach ($project->getSprints() as $sprint) {
            $sprint->setIsArchived(true);
        }
    }

    private function softDeleteChat(Chat $chat): void
    {
        $chat->setIsArchived(true);

        foreach ($chat->getMessages() as $message) {
            $message->setIsDeleted(true);
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
