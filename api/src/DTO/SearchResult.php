<?php

namespace App\DTO;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Parameter;
use App\State\Search\SearchResultProvider;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/search',
            openapi: new Operation(
                summary: 'Global Search',
                description: 'Search across issues, projects, organizations, chats, and users that the authenticated user has access to.',
                parameters: [
                    new Parameter(
                        name: 'q',
                        in: 'query',
                        required: false,
                        schema: ['type' => 'string'],
                        description: 'Search query string'
                    )
                ]
            ),
            provider: SearchResultProvider::class,
        )
    ]
)]
class SearchResult
{
    public array $issues = [];

    public array $projects = [];

    public array $organizations = [];

    public array $chats = [];

    public array $users = [];
}
