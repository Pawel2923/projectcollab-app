<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Project>
 */
class ProjectRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Project::class);
    }

    /**
     * Search projects accessible by the given user matching the search term.
     *
     * @return array<array{id: int, name: string, organizationName: string, organizationId: int}>
     */
    public function searchByTermForUser(string $searchTerm, User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('p')
            ->select('DISTINCT p.id, p.name, o.name as organizationName, o.id as organizationId')
            ->join('p.organization', 'o')
            ->leftJoin('p.projectMembers', 'pm')
            ->leftJoin('o.organizationMembers', 'om')
            ->leftJoin('om.role', 'omr')
            ->where('LOWER(p.name) LIKE :query')
            ->andWhere('
                (pm.member = :user AND pm.isBlocked = false)
                OR
                (om.member = :user AND om.isBlocked = false AND omr.value = :adminRole)
            ')
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setParameter('adminRole', 'ADMIN')
            ->orderBy('p.name', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
