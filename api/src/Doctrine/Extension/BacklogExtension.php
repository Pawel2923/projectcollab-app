<?php

namespace App\Doctrine\Extension;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Issue;
use App\Entity\IssueSprint;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;

final readonly class BacklogExtension implements QueryCollectionExtensionInterface
{
    public function __construct(
        private RequestStack $requestStack
    )
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ($resourceClass !== Issue::class) {
            return;
        }

        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return;
        }

        if ($request->query->get('backlog') === 'true') {
            $rootAlias = $queryBuilder->getRootAliases()[0];
            $subQueryBuilder = $queryBuilder->getEntityManager()->createQueryBuilder();

            $subQuery = $subQueryBuilder
                ->select('1')
                ->from(IssueSprint::class, 'issueSprint')
                ->join('issueSprint.sprint', 'sprint')
                ->where("issueSprint.issue = $rootAlias.id")
                ->andWhere('issueSprint.isArchived = :isArchivedFalse')
                ->andWhere('sprint.isArchived = :isArchivedFalse')
                ->getDQL();

            $queryBuilder->andWhere($queryBuilder->expr()->not($queryBuilder->expr()->exists($subQuery)));
            $queryBuilder->setParameter('isArchivedFalse', false);
        }
    }
}
