<?php

namespace App\State\Project;

use ApiPlatform\Doctrine\Orm\State\CollectionProvider;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;

readonly class ProjectCollectionProvider implements ProviderInterface
{
    public function __construct(
        private CollectionProvider     $collectionProvider,
        private Security               $security,
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return [];
        }

        return $this->collectionProvider->provide($operation, $uriVariables, $context);
    }
}
