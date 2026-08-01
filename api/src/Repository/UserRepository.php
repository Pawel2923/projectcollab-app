<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Search users who share at least one organization with the current user matching the search term.
     *
     * @return array<array{id: int, email: string, username: string}>
     */
    public function searchByTermForUser(string $searchTerm, User $user, int $limit = 10): array
    {
        $dql = "
            SELECT DISTINCT u.id, u.email, u.username
            FROM App\Entity\OrganizationMember om
            JOIN om.member u
            JOIN om.organization o
            JOIN o.organizationMembers om2
            WHERE (LOWER(u.email) LIKE :query OR LOWER(u.username) LIKE :query)
            AND om2.member = :user
            AND om2.isBlocked = false
            AND u.id != :userId
            ORDER BY u.username ASC
        ";

        return $this->getEntityManager()->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setParameter('userId', $user->getId())
            ->setMaxResults($limit)
            ->getResult();
    }
}
