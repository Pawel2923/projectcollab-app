<?php

namespace App\Service\SoftDelete;

use App\Entity\Sprint;

/**
 * @implements SoftDeleteInterface<Sprint>
 */
readonly class SprintSoftDeleteService implements SoftDeleteInterface
{
    /**
     * @inheritDoc
     */
    public function softDelete(object $entity): void
    {
        assert($entity instanceof Sprint);

        $entity->setIsArchived(true);
    }
}
