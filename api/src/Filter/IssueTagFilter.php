<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

class IssueTagFilter extends AbstractFilter
{
    /**
     * @inheritDoc
     */
    protected function filterProperty(string $property, mixed $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ($property !== 'issueId' || !$value) {
            $this->logger->debug("Property is not issue or value is null: property = $property; value = $value");
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $paramName = $queryNameGenerator->generateParameterName($property);

        $issueTagAlias = $queryNameGenerator->generateJoinAlias('issueTag');
        $issueAlias = $queryNameGenerator->generateJoinAlias('issue');

        $queryBuilder
            ->join("$rootAlias.issueTags", $issueTagAlias)
            ->join("$issueTagAlias.issue", $issueAlias)
            ->andWhere("$issueAlias.id = :$paramName")
            ->setParameter($paramName, $value);
    }

    /**
     * @inheritDoc
     */
    public function getDescription(string $resourceClass): array
    {
        if (!$this->properties) {
            $this->logger->debug("There are no properties");
            return [];
        }

        return [
            'issueId' => [
                'property' => 'issueId',
                'type' => 'string',
                'required' => false,
                'description' => 'Filter tags by associated issue id'
            ]
        ];
    }
}
