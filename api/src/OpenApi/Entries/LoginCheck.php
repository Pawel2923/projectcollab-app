<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\Model;
use Symfony\Component\HttpFoundation\Response;

class LoginCheck extends DocsEntry
{
    public function addDocs(): void
    {
        $this->openApi
            ->getPaths()
            ->addPath(
                '/auth/refresh',
                new Model\PathItem()->withPost(
                    new Model\Operation()
                        ->withOperationId('gesdinet_jwt_refresh_token')
                        ->withTags(['Login Check'])
                        ->withSummary('Refresh Token')
                        ->withDescription('Refresh token.')
                        ->withSecurity()
                        ->withResponses([
                            Response::HTTP_OK => [
                                'description' => 'Token refreshed successfully',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'message' => [
                                                    'type' => 'string',
                                                    'example' => 'Token refreshed successfully.',
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            Response::HTTP_UNAUTHORIZED => [
                                'description' => 'Invalid or expired token',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'code' => [
                                                    'type' => 'integer',
                                                    'example' => 401
                                                ],
                                                'message' => [
                                                    'type' => 'string',
                                                    'example' => 'Missing JWT Refresh Token'
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
