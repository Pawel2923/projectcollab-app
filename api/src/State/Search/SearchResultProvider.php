<?php

namespace App\State\Search;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\SearchResult;
use App\Entity\User;
use App\Exception\UserNotAuthenticatedException;
use App\Repository\ChatRepository;
use App\Repository\IssueRepository;
use App\Repository\OrganizationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

readonly class SearchResultProvider implements ProviderInterface
{
    public function __construct(
        private IssueRepository        $issueRepository,
        private ProjectRepository      $projectRepository,
        private OrganizationRepository $organizationRepository,
        private ChatRepository         $chatRepository,
        private UserRepository         $userRepository,
        private Security               $security,
        private RequestStack           $requestStack,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): SearchResult
    {
        $user = $this->security->getUser();
        if (!($user instanceof User)) {
            throw new UserNotAuthenticatedException();
        }

        $searchResult = new SearchResult();

        $filters = $context['filters'] ?? [];
        $query = $filters['q'] ?? $this->requestStack->getCurrentRequest()?->query->get('q');

        if (!$query) {
            return $searchResult;
        }

        $searchTerm = '%' . mb_strtolower(trim($query)) . '%';

        $searchResult->issues = $this->issueRepository->searchByTermForUser($searchTerm, $user);
        $searchResult->projects = $this->projectRepository->searchByTermForUser($searchTerm, $user);
        $searchResult->organizations = $this->organizationRepository->searchByTermForUser($searchTerm, $user);
        $searchResult->chats = $this->chatRepository->searchByTermForUser($searchTerm, $user);
        $searchResult->users = $this->userRepository->searchByTermForUser($searchTerm, $user);

        return $searchResult;
    }
}
