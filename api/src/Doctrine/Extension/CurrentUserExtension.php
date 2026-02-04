<?php

namespace App\Doctrine\Extension;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Chat;
use App\Entity\Comment;
use App\Entity\Issue;
use App\Entity\Message;
use App\Entity\Organization;
use App\Entity\Project;
use App\Entity\Sprint;
use App\Entity\User;
use App\Service\RoleCacheService;
use Doctrine\ORM\QueryBuilder;
use Psr\Cache\InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;

final readonly class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(
        private Security         $security,
        private RoleCacheService $roleCacheService,
    )
    {
    }

    /**
     * @throws InvalidArgumentException
     */
    public function applyToCollection(
        QueryBuilder                $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string                      $resourceClass,
        ?Operation                  $operation = null,
        array                       $context = []
    ): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    /**
     * @throws InvalidArgumentException
     */
    public function applyToItem(
        QueryBuilder                $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string                      $resourceClass, array $identifiers,
        ?Operation                  $operation = null,
        array                       $context = []
    ): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    /**
     * @throws InvalidArgumentException
     */
    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if ($this->security->isGranted('ROLE_ADMIN')) {
            return;
        }

        /** @var User|null $user */
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $userId = $user->getId();

        if ($resourceClass === Organization::class) {
            $memberships = $this->roleCacheService->getUserMemberships($userId);
            $organizationMemberships = $memberships['organizations'] ?? [];

            $accessibleOrgIds = array_keys(array_filter($organizationMemberships, fn($m) => !$m['isBlocked']));

            if (empty($accessibleOrgIds)) {
                $queryBuilder->andWhere("$rootAlias.id IS NULL");
            } else {
                $queryBuilder->andWhere("$rootAlias.id IN (:accessibleOrgIds)")
                    ->setParameter('accessibleOrgIds', $accessibleOrgIds);
            }
        }

        if ($resourceClass === Project::class) {
            $queryBuilder
                ->leftJoin("$rootAlias.projectMembers", 'pm_ext')
                ->leftJoin("$rootAlias.organization", 'o_ext')
                ->leftJoin('o_ext.organizationMembers', 'om_ext')
                ->leftJoin('pm_ext.role', 'pr_ext')
                ->leftJoin('om_ext.role', 'orgr_ext')
                ->andWhere(
                    $queryBuilder->expr()->orX(
                        $queryBuilder->expr()->andX(
                            'pm_ext.member = :currentUser',
                            'pm_ext.isBlocked = :false',
                            'pr_ext.value IN (:projectRoles)'
                        ),
                        $queryBuilder->expr()->andX(
                            'om_ext.member = :currentUser',
                            'om_ext.isBlocked = :false',
                            'orgr_ext.value = :orgAdminRole'
                        )
                    )
                )
                ->setParameter('currentUser', $userId)
                ->setParameter('false', false)
                ->setParameter('projectRoles', ['ADMIN', 'CREATOR', 'VIEWER', 'EDITOR', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'MEMBER'])
                ->setParameter('orgAdminRole', 'ADMIN');
        }

        if ($resourceClass === Issue::class || $resourceClass === Sprint::class) {
            $queryBuilder
                ->join("$rootAlias.project", 'p_ext')
                ->leftJoin("p_ext.projectMembers", 'pm_ext')
                ->leftJoin("p_ext.organization", 'o_ext')
                ->leftJoin('o_ext.organizationMembers', 'om_ext')
                ->leftJoin('pm_ext.role', 'pr_ext')
                ->leftJoin('om_ext.role', 'orgr_ext')
                ->andWhere(
                    $queryBuilder->expr()->orX(
                        $queryBuilder->expr()->andX(
                            'pm_ext.member = :currentUser',
                            'pm_ext.isBlocked = :false',
                            'pr_ext.value IN (:projectRoles)'
                        ),
                        $queryBuilder->expr()->andX(
                            'om_ext.member = :currentUser',
                            'om_ext.isBlocked = :false',
                            'orgr_ext.value = :orgAdminRole'
                        )
                    )
                )
                ->setParameter('currentUser', $userId)
                ->setParameter('false', false)
                ->setParameter('projectRoles', ['ADMIN', 'CREATOR', 'VIEWER', 'EDITOR', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'MEMBER'])
                ->setParameter('orgAdminRole', 'ADMIN');
        }

        if ($resourceClass === Chat::class) {
            $queryBuilder
                ->join("$rootAlias.chatMembers", 'cm_ext')
                ->andWhere('cm_ext.member = :currentUser')
                ->setParameter('currentUser', $userId);
        }

        if ($resourceClass === Message::class) {
            $queryBuilder
                ->join("$rootAlias.chat", 'c_ext')
                ->join('c_ext.chatMembers', 'cm_ext')
                ->andWhere('cm_ext.member = :currentUser')
                ->setParameter('currentUser', $userId);
        }

        if ($resourceClass === Comment::class) {
            // Comment -> Issue -> Project ...
            $queryBuilder
                ->join("$rootAlias.issue", 'i_ext')
                ->join('i_ext.project', 'p_ext')
                ->leftJoin("p_ext.projectMembers", 'pm_ext')
                ->leftJoin("p_ext.organization", 'o_ext')
                ->leftJoin('o_ext.organizationMembers', 'om_ext')
                ->leftJoin('pm_ext.role', 'pr_ext')
                ->leftJoin('om_ext.role', 'orgr_ext')
                ->andWhere(
                    $queryBuilder->expr()->orX(
                        $queryBuilder->expr()->andX(
                            'pm_ext.member = :currentUser',
                            'pm_ext.isBlocked = :false',
                            'pr_ext.value IN (:projectRoles)'
                        ),
                        $queryBuilder->expr()->andX(
                            'om_ext.member = :currentUser',
                            'om_ext.isBlocked = :false',
                            'orgr_ext.value = :orgAdminRole'
                        )
                    )
                )
                ->setParameter('currentUser', $userId)
                ->setParameter('false', false)
                ->setParameter('projectRoles', ['ADMIN', 'CREATOR', 'VIEWER', 'EDITOR', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'MEMBER'])
                ->setParameter('orgAdminRole', 'ADMIN');
        }
    }
}
