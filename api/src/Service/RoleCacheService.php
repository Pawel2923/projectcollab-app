<?php

namespace App\Service;

use App\Repository\ChatMemberRepository;
use App\Repository\OrganizationMemberRepository;
use App\Repository\ProjectMemberRepository;
use Psr\Cache\InvalidArgumentException;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

readonly class RoleCacheService
{
    private const int CACHE_TTL = 3600; // 1 hour

    public function __construct(
        private CacheInterface               $cache,
        private OrganizationMemberRepository $organizationMemberRepository,
        private ProjectMemberRepository      $projectMemberRepository,
        private ChatMemberRepository         $chatMemberRepository,
    )
    {
    }

    /**
     * Get all user memberships from cache or database
     *
     * @param int $userId The user ID to fetch memberships for
     * @return array{organizations: array, projects: array, chats: array}
     * @throws InvalidArgumentException
     */
    public function getUserMemberships(int $userId): array
    {
        $cacheKey = "user_memberships_$userId";

        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($userId) {
            $item->expiresAfter(self::CACHE_TTL);

            return [
                'organizations' => $this->getOrganizationMemberships($userId),
                'projects' => $this->getProjectMemberships($userId),
                'chats' => $this->getChatMemberships($userId),
            ];
        });
    }

    /**
     * Invalidate all user memberships cache
     *
     * @param int $userId The user ID to invalidate cache for
     * @throws InvalidArgumentException
     */
    public function invalidateAllUserMemberships(int $userId): void
    {
        $cacheKey = "user_memberships_$userId";
        $this->cache->delete($cacheKey);
    }

    /**
     * Get organization memberships for a user
     *
     * @return array Array of organization memberships with id, role, isBlocked
     */
    private function getOrganizationMemberships(int $userId): array
    {
        $memberships = $this->organizationMemberRepository->createQueryBuilder('om')
            ->select('om.id', 'IDENTITY(om.organization) as organizationId', 'om.isBlocked', 'r.value as role')
            ->leftJoin('om.role', 'r')
            ->where('om.member = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();

        $result = [];
        foreach ($memberships as $membership) {
            $result[$membership['organizationId']] = [
                'id' => $membership['id'],
                'role' => $membership['role'],
                'isBlocked' => $membership['isBlocked'],
            ];
        }

        return $result;
    }

    /**
     * Get project memberships for a user
     *
     * @return array Array of project memberships with id, role, isBlocked
     */
    private function getProjectMemberships(int $userId): array
    {
        $memberships = $this->projectMemberRepository->createQueryBuilder('pm')
            ->select('pm.id', 'IDENTITY(pm.project) as projectId', 'pm.isBlocked', 'r.value as role')
            ->leftJoin('pm.role', 'r')
            ->where('pm.member = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();

        $result = [];
        foreach ($memberships as $membership) {
            $result[$membership['projectId']] = [
                'id' => $membership['id'],
                'role' => $membership['role'],
                'isBlocked' => $membership['isBlocked'],
            ];
        }

        return $result;
    }

    /**
     * Get chat memberships for a user
     *
     * @return array Array of chat memberships with id, role
     */
    private function getChatMemberships(int $userId): array
    {
        $memberships = $this->chatMemberRepository->createQueryBuilder('cm')
            ->select('cm.id', 'IDENTITY(cm.chat) as chatId', 'r.value as role')
            ->leftJoin('cm.role', 'r')
            ->where('cm.member = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();

        $result = [];
        foreach ($memberships as $membership) {
            $result[$membership['chatId']] = [
                'id' => $membership['id'],
                'role' => $membership['role'],
            ];
        }

        return $result;
    }
}
