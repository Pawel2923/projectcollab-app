<?php

namespace App\Tests\State\Search;

use ApiPlatform\Metadata\Get;
use App\DTO\SearchResult;
use App\Entity\User;
use App\Exception\UserNotAuthenticatedException;
use App\Repository\ChatRepository;
use App\Repository\IssueRepository;
use App\Repository\OrganizationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use App\State\Search\SearchResultProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class SearchResultProviderTest extends TestCase
{
    public function testProvideThrowsExceptionWhenUserNotLoggedIn(): void
    {
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn(null);

        $requestStack = new RequestStack();
        $requestStack->push(new Request(['q' => 'test']));

        $provider = new SearchResultProvider(
            $this->createMock(IssueRepository::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(OrganizationRepository::class),
            $this->createMock(ChatRepository::class),
            $this->createMock(UserRepository::class),
            $securityMock,
            $requestStack
        );

        $this->expectException(UserNotAuthenticatedException::class);
        $provider->provide(new Get());
    }

    public function testProvideReturnsEmptyArraysWhenQueryIsEmpty(): void
    {
        $user = new User();
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn($user);

        $requestStack = new RequestStack();
        $requestStack->push(new Request());

        $provider = new SearchResultProvider(
            $this->createMock(IssueRepository::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(OrganizationRepository::class),
            $this->createMock(ChatRepository::class),
            $this->createMock(UserRepository::class),
            $securityMock,
            $requestStack
        );

        $result = $provider->provide(new Get());

        $this->assertInstanceOf(SearchResult::class, $result);
        $this->assertSame([], $result->issues);
        $this->assertSame([], $result->projects);
        $this->assertSame([], $result->organizations);
        $this->assertSame([], $result->chats);
        $this->assertSame([], $result->users);
    }

    public function testProvideDelegatesToRepositoriesWhenQueryProvided(): void
    {
        $user = new User();
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn($user);

        $issueRepo = $this->createMock(IssueRepository::class);
        $projectRepo = $this->createMock(ProjectRepository::class);
        $orgRepo = $this->createMock(OrganizationRepository::class);
        $chatRepo = $this->createMock(ChatRepository::class);
        $userRepo = $this->createMock(UserRepository::class);

        $searchTerm = '%bug%';
        $issueRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([['id' => 1, 'title' => 'Bug fix', 'key' => 'PROJ-1']]);

        $projectRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([['id' => 10, 'name' => 'Bug Tracker']]);

        $orgRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([]);

        $chatRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([]);

        $userRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([]);

        $requestStack = new RequestStack();
        $requestStack->push(new Request(['q' => 'Bug']));

        $provider = new SearchResultProvider(
            $issueRepo,
            $projectRepo,
            $orgRepo,
            $chatRepo,
            $userRepo,
            $securityMock,
            $requestStack
        );

        $result = $provider->provide(new Get());

        $this->assertInstanceOf(SearchResult::class, $result);
        $this->assertCount(1, $result->issues);
        $this->assertEquals('Bug fix', $result->issues[0]['title']);
        $this->assertCount(1, $result->projects);
        $this->assertEquals('Bug Tracker', $result->projects[0]['name']);
    }
}
