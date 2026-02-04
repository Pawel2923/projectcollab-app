<?php

namespace App\Doctrine\Extension;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Chat;
use App\Entity\Comment;
use App\Entity\Issue;
use App\Entity\IssueSprint;
use App\Entity\Message;
use App\Entity\Organization;
use App\Entity\Project;
use App\Entity\Sprint;
use App\Entity\Tag;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final readonly class SoftDeleteExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(
        private Security $security
    )
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        $this->addSoftDeleteFilter($queryBuilder, $resourceClass);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, ?Operation $operation = null, array $context = []): void
    {
        $this->addSoftDeleteFilter($queryBuilder, $resourceClass);
    }

    private function addSoftDeleteFilter(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if ($this->security->isGranted('ROLE_ADMIN')) {
            return;
        }

        if (
            $resourceClass === Organization::class ||
            $resourceClass === Chat::class ||
            $resourceClass === Comment::class ||
            $resourceClass === Issue::class ||
            $resourceClass === Tag::class ||
            $resourceClass === Project::class ||
            $resourceClass === Sprint::class ||
            $resourceClass === IssueSprint::class
        ) {
            $rootAlias = $queryBuilder->getRootAliases()[0];

            $queryBuilder->andWhere("$rootAlias.isArchived = :isArchived");
            $queryBuilder->setParameter('isArchived', false);

            return;
        }

        if ($resourceClass === Message::class) {
            $rootAlias = $queryBuilder->getRootAliases()[0];

            $queryBuilder->andWhere("$rootAlias.isDeleted = :isDeleted");
            $queryBuilder->setParameter('isDeleted', false);
        }
    }
}
