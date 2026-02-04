<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\Model;
use Symfony\Component\HttpFoundation\Response;

class Logout extends DocsEntry
{
    public function addDocs(): void
    {
        $this->openApi
            ->getPaths()
            ->addPath(
                '/auth/logout',
                new Model\PathItem()->withPost(
                    new Model\Operation()
                        ->withOperationId('auth_logout')
                        ->withTags(['Authentication'])
                        ->withSummary('Logout')
                        ->withDescription('Logout user and invalidate refresh token.')
                        ->withSecurity()
                        ->withRequestBody(
                            new Model\RequestBody(
                                content: new \ArrayObject([
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'required' => ['refresh_token'],
                                            'properties' => [
                                                'refresh_token' => [
                                                    'type' => 'string',
                                                    'description' => 'Refresh token to invalidate'
                                                ]
                                            ]
                                        ]
                                    ]
                                ])
                            )
                        )
                        ->withResponses([
                            Response::HTTP_NO_CONTENT => [
                                'description' => 'Logout successful'
                            ],
                            Response::HTTP_BAD_REQUEST => [
                                'description' => 'Invalid request or missing refresh token',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'error' => [
                                                    'type' => 'string',
                                                    'example' => 'MISSING_REFRESH_TOKEN'
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
