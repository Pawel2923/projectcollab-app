<?php

namespace App\Service\SoftDelete;

use App\Entity\Issue;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements SoftDeleteInterface<Issue>
 */
readonly class IssueSoftDeleteService implements SoftDeleteInterface
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
        assert($entity instanceof Issue);

        $entity->setIsArchived(true);

        foreach ($entity->getComments() as $comment) {
            $comment->setIsArchived(true);
        }

        foreach ($entity->getAttachments() as $attachment) {
            $this->entityManager->remove($attachment);
        }
    }
}
