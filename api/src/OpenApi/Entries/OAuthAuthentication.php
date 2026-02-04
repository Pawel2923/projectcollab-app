<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\Model;
use Symfony\Component\HttpFoundation\Response;

class OAuthAuthentication extends DocsEntry
{
    public function addDocs(): void
    {
        $this->openApi
            ->getPaths()
            ->addPath(
                '/auth/oauth/{provider}',
                new Model\PathItem()->withPost(
                    new Model\Operation()
                        ->withOperationId('auth_oauth_check')
                        ->withTags(['Authentication'])
                        ->withSummary('OAuth Authentication')
                        ->withDescription('Authenticate user via OAuth provider (Google, Microsoft).')
                        ->withSecurity()
                        ->withParameters([
                            new Model\Parameter(
                                name: 'provider',
                                in: 'path',
                                required: true,
                                schema: [
                                    'type' => 'string',
                                    'enum' => ['google', 'microsoft']
                                ],
                                description: 'OAuth provider name'
                            )
                        ])
                        ->withRequestBody(
                            new Model\RequestBody(
                                content: new \ArrayObject([
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'required' => ['token'],
                                            'properties' => [
                                                'token' => [
                                                    'type' => 'string',
                                                    'description' => 'OAuth access token from provider'
                                                ]
                                            ]
                                        ]
                                    ]
                                ])
                            )
                        )
                        ->withResponses([
                            Response::HTTP_OK => [
                                'description' => 'Authentication successful',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'token' => [
                                                    'type' => 'string',
                                                    'description' => 'JWT access token'
                                                ],
                                                'refresh_token' => [
                                                    'type' => 'string',
                                                    'description' => 'JWT refresh token'
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            Response::HTTP_UNAUTHORIZED => [
                                'description' => 'Invalid OAuth token or provider',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'message' => [
                                                    'type' => 'string',
                                                    'example' => 'Authentication failed or not handled'
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
