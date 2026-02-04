<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\Model;
use Symfony\Component\HttpFoundation\Response;

class Search extends DocsEntry
{
    public function addDocs(): void
    {
        $this->openApi
            ->getPaths()
            ->addPath(
                '/search',
                new Model\PathItem()->withGet(
                    new Model\Operation()
                        ->withOperationId('api_search')
                        ->withTags(['Search'])
                        ->withSummary('Global Search')
                        ->withDescription('Search across issues, projects, organizations, chats, and users that the authenticated user has access to.')
                        ->withSecurity([['bearerAuth' => []]])
                        ->withParameters([
                            new Model\Parameter(
                                name: 'q',
                                in: 'query',
                                required: false,
                                schema: [
                                    'type' => 'string'
                                ],
                                description: 'Search query string'
                            )
                        ])
                        ->withResponses([
                            Response::HTTP_OK => [
                                'description' => 'Search results',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'issues' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'title' => ['type' => 'string'],
                                                            'key' => ['type' => 'string'],
                                                            'type' => ['type' => 'string'],
                                                            'projectName' => ['type' => 'string'],
                                                            'projectId' => ['type' => 'integer'],
                                                            'organizationId' => ['type' => 'integer']
                                                        ]
                                                    ]
                                                ],
                                                'projects' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'name' => ['type' => 'string'],
                                                            'organizationName' => ['type' => 'string'],
                                                            'organizationId' => ['type' => 'integer']
                                                        ]
                                                    ]
                                                ],
                                                'organizations' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'name' => ['type' => 'string']
                                                        ]
                                                    ]
                                                ],
                                                'chats' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'name' => ['type' => 'string'],
                                                            'organizationId' => ['type' => 'integer'],
                                                            'organizationName' => ['type' => 'string']
                                                        ]
                                                    ]
                                                ],
                                                'users' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'email' => ['type' => 'string'],
                                                            'username' => ['type' => 'string']
                                                        ]
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            Response::HTTP_UNAUTHORIZED => [
                                'description' => 'User not authenticated',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'error' => [
                                                    'type' => 'string',
                                                    'example' => 'Unauthorized'
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ])
                )
            );
    }
}
