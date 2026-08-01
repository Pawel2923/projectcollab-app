<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\ChatRepository;
use App\Repository\IssueRepository;
use App\Repository\OrganizationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/core-api')]
class SearchController extends AbstractController
{
    public function __construct(
        private readonly IssueRepository        $issueRepository,
        private readonly ProjectRepository      $projectRepository,
        private readonly OrganizationRepository $organizationRepository,
        private readonly ChatRepository         $chatRepository,
        private readonly UserRepository         $userRepository,
        private readonly Security               $security
    )
    {
    }

    #[Route('/search', name: 'api_search', methods: ['GET'])]
    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
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
            'issues' => $this->issueRepository->searchByTermForUser($searchTerm, $user),
            'projects' => $this->projectRepository->searchByTermForUser($searchTerm, $user),
            'organizations' => $this->organizationRepository->searchByTermForUser($searchTerm, $user),
            'chats' => $this->chatRepository->searchByTermForUser($searchTerm, $user),
            'users' => $this->userRepository->searchByTermForUser($searchTerm, $user),
        ];

        return new JsonResponse($results);
    }
}

