<?php

namespace App\Repository;

use App\Entity\Chat;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Chat>
 */
class ChatRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Chat::class);
    }

    /**
     * Search chats accessible by the given user matching the search term.
     *
     * @return array<array{id: int, name: string, organizationId: int, organizationName: string}>
     */
    public function searchByTermForUser(string $searchTerm, User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('c')
            ->select('DISTINCT c.id, c.name, o.id as organizationId, o.name as organizationName')
            ->join('c.chatMembers', 'cm')
            ->join('c.organization', 'o')
            ->where('LOWER(c.name) LIKE :query')
            ->andWhere('cm.member = :user')
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->orderBy('c.name', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
