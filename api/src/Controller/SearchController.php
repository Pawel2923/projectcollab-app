<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class SearchController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security               $security
    )
    {
    }

    #[Route('/search', name: 'api_search', methods: ['GET'])]
    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $query = $request->query->get('q');
        if (!$query) {
            return new JsonResponse([
                'issues' => [],
                'projects' => [],
                'organizations' => [],
                'chats' => [],
                'users' => [],
            ]);
        }

        // Add wildcards for partial match
        $searchTerm = '%' . mb_strtolower(trim($query)) . '%';

        $results = [
            'issues' => $this->searchIssues($searchTerm, $user),
            'projects' => $this->searchProjects($searchTerm, $user),
            'organizations' => $this->searchOrganizations($searchTerm, $user),
            'chats' => $this->searchChats($searchTerm, $user),
            'users' => $this->searchUsers($searchTerm, $user),
        ];

        return new JsonResponse($results);
    }

    private function searchIssues(string $searchTerm, $user): array
    {
        $dql = "
            SELECT DISTINCT i.id, i.title, i.key, t.value as type, p.name as projectName, p.id as projectId, o.id as organizationId
            FROM App\Entity\Issue i
            JOIN i.project p
            JOIN i.type t
            JOIN p.organization o
            LEFT JOIN p.projectMembers pm
            LEFT JOIN o.organizationMembers om
            LEFT JOIN om.role omr
            WHERE (LOWER(i.title) LIKE :query OR LOWER(i.key) LIKE :query)
            AND (
                (pm.member = :user AND pm.isBlocked = false)
                OR
                (om.member = :user AND om.isBlocked = false AND omr.value = 'ADMIN')
            )
            ORDER BY i.id DESC
        ";

        $query = $this->entityManager->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setMaxResults(10);

        return $query->getResult();
    }

    private function searchProjects(string $searchTerm, $user): array
    {
        $dql = "
            SELECT DISTINCT p.id, p.name, o.name as organizationName, o.id as organizationId
            FROM App\Entity\Project p
            JOIN p.organization o
            LEFT JOIN p.projectMembers pm
            LEFT JOIN o.organizationMembers om
            LEFT JOIN om.role omr
            WHERE LOWER(p.name) LIKE :query
            AND (
                (pm.member = :user AND pm.isBlocked = false)
                OR
                (om.member = :user AND om.isBlocked = false AND omr.value = 'ADMIN')
            )
            ORDER BY p.name ASC
        ";

        $query = $this->entityManager->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setMaxResults(10);

        return $query->getResult();
    }

    private function searchOrganizations(string $searchTerm, $user): array
    {
        $dql = "
            SELECT DISTINCT o.id, o.name
            FROM App\Entity\Organization o
            JOIN o.organizationMembers om
            WHERE LOWER(o.name) LIKE :query
            AND om.member = :user
            AND om.isBlocked = false
            ORDER BY o.name ASC
        ";

        $query = $this->entityManager->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setMaxResults(10);

        return $query->getResult();
    }

    private function searchChats(string $searchTerm, $user): array
    {
        $dql = "
            SELECT DISTINCT c.id, c.name, o.id as organizationId, o.name as organizationName
            FROM App\Entity\Chat c
            JOIN c.chatMembers cm
            JOIN c.organization o
            WHERE LOWER(c.name) LIKE :query
            AND cm.member = :user
            ORDER BY c.name ASC
        ";

        $query = $this->entityManager->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setMaxResults(10);

        return $query->getResult();
    }

    private function searchUsers(string $searchTerm, $user): array
    {
        // Search users who share at least one organization with the current user
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

        $query = $this->entityManager->createQuery($dql)
            ->setParameter('query', $searchTerm)
            ->setParameter('user', $user)
            ->setParameter('userId', $user->getId())
            ->setMaxResults(10);

        return $query->getResult();
    }
}
