<?php

namespace App\Tests\Controller;

use App\Controller\SearchController;
use App\Entity\User;
use App\Repository\ChatRepository;
use App\Repository\IssueRepository;
use App\Repository\OrganizationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class SearchControllerTest extends TestCase
{
    public function testInvokeReturnsUnauthorizedWhenUserNotLoggedIn(): void
    {
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn(null);

        $controller = new SearchController(
            $this->createMock(IssueRepository::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(OrganizationRepository::class),
            $this->createMock(ChatRepository::class),
            $this->createMock(UserRepository::class),
            $securityMock
        );

        $request = new Request(['q' => 'test']);
        $response = $controller($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
    }

    public function testInvokeReturnsEmptyArraysWhenQueryIsEmpty(): void
    {
        $user = new User();
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn($user);

        $controller = new SearchController(
            $this->createMock(IssueRepository::class),
            $this->createMock(ProjectRepository::class),
            $this->createMock(OrganizationRepository::class),
            $this->createMock(ChatRepository::class),
            $this->createMock(UserRepository::class),
            $securityMock
        );

        $request = new Request();
        $response = $controller($request);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);

        $this->assertEquals([
            'issues' => [],
            'projects' => [],
            'organizations' => [],
            'chats' => [],
            'users' => [],
        ], $data);
    }

    public function testInvokeDelegatesToRepositoriesWhenQueryProvided(): void
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
            ->willReturn([['id' => 1, 'title' => 'Bug fix', 'key' => 'PROJ-1', 'type' => 'Bug', 'projectName' => 'Alpha', 'projectId' => 10, 'organizationId' => 5]]);

        $projectRepo->expects($this->once())
            ->method('searchByTermForUser')
            ->with($searchTerm, $user)
            ->willReturn([['id' => 10, 'name' => 'Bug Tracker', 'organizationName' => 'Org A', 'organizationId' => 5]]);

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

        $controller = new SearchController(
            $issueRepo,
            $projectRepo,
            $orgRepo,
            $chatRepo,
            $userRepo,
            $securityMock
        );

        $request = new Request(['q' => 'Bug']);
        $response = $controller($request);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);

        $this->assertCount(1, $data['issues']);
        $this->assertEquals('Bug fix', $data['issues'][0]['title']);
        $this->assertCount(1, $data['projects']);
        $this->assertEquals('Bug Tracker', $data['projects'][0]['name']);
    }
}
