<?php

namespace App\Repository;

use App\Entity\Organization;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Organization>
 */
class OrganizationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Organization::class);
    }

    /**
     * Search organizations accessible by the given user matching the search term.
     *
     * @return array<array{id: int, name: string}>
     */
    public function searchByTermForUser(string $searchTerm, User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('o')
            ->select('DISTINCT o.id, o.name')
            ->join('o.organizationMembers', 'om')
            ->where('LOWER(o.name) LIKE :query')
            ->andWhere('om.member = :user')
            ->andWhere('om.isBlocked = false')
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->orderBy('o.name', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
