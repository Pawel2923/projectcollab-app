<?php

namespace App\Service\SoftDelete;

/** @template T of object */
interface SoftDeleteInterface
{
    /**
     * Add soft delete flag to entity and it's associated entities
     * @param T $entity
     */
    public function softDelete(object $entity): void;
}
