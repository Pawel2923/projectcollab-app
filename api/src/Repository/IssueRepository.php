<?php

namespace App\Repository;

use App\Entity\Issue;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Issue>
 */
class IssueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Issue::class);
    }

    /**
     * Search issues accessible by the given user matching the search term.
     *
     * @return array<array{id: int, title: string, key: string, type: string, projectName: string, projectId: int, organizationId: int}>
     */
    public function searchByTermForUser(string $searchTerm, User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('i')
            ->select('DISTINCT i.id, i.title, i.key, t.value as type, p.name as projectName, p.id as projectId, o.id as organizationId')
            ->join('i.project', 'p')
            ->join('i.type', 't')
            ->join('p.organization', 'o')
            ->leftJoin('p.projectMembers', 'pm')
            ->leftJoin('o.organizationMembers', 'om')
            ->leftJoin('om.role', 'omr')
            ->where('(LOWER(i.title) LIKE :query OR LOWER(i.key) LIKE :query)')
            ->andWhere('
                (pm.member = :user AND pm.isBlocked = false)
                OR
                (om.member = :user AND om.isBlocked = false AND omr.value = :adminRole)
            ')
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setParameter('adminRole', 'ADMIN')
            ->orderBy('i.id', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
