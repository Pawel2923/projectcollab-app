<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\Model;
use Symfony\Component\HttpFoundation\Response;

class ReportGeneration extends DocsEntry
{
    public function addDocs(): void
    {
        $this->openApi
            ->getPaths()
            ->addPath(
                '/reports/generate',
                new Model\PathItem()->withPost(
                    new Model\Operation()
                        ->withOperationId('api_reports_generate')
                        ->withTags(['Reports'])
                        ->withSummary('Generate Report')
                        ->withDescription('Generate a project report in specified format (PDF, CSV, or XLSX).')
                        ->withSecurity([['bearerAuth' => []]])
                        ->withRequestBody(
                            new Model\RequestBody(
                                content: new \ArrayObject([
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'required' => ['projectId'],
                                            'properties' => [
                                                'projectId' => [
                                                    'type' => 'integer',
                                                    'description' => 'ID of the project to generate report for'
                                                ],
                                                'type' => [
                                                    'type' => 'string',
                                                    'enum' => ['activity', 'performance', 'summary'],
                                                    'default' => 'activity',
                                                    'description' => 'Type of report to generate'
                                                ],
                                                'format' => [
                                                    'type' => 'string',
                                                    'enum' => ['pdf', 'csv', 'xlsx'],
                                                    'default' => 'pdf',
                                                    'description' => 'Output format'
                                                ],
                                                'dateFrom' => [
                                                    'type' => 'string',
                                                    'format' => 'date',
                                                    'nullable' => true,
                                                    'description' => 'Start date for report data (optional)'
                                                ],
                                                'dateTo' => [
                                                    'type' => 'string',
                                                    'format' => 'date',
                                                    'nullable' => true,
                                                    'description' => 'End date for report data (optional)'
                                                ]
                                            ]
                                        ]
                                    ]
                                ])
                            )
                        )
                        ->withResponses([
                            Response::HTTP_CREATED => [
                                'description' => 'Report generated successfully',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'id' => [
                                                    'type' => 'integer'
                                                ],
                                                'name' => [
                                                    'type' => 'string'
                                                ],
                                                'type' => [
                                                    'type' => 'string'
                                                ],
                                                'format' => [
                                                    'type' => 'string'
                                                ],
                                                'fileUrl' => [
                                                    'type' => 'string',
                                                    'description' => 'URL to download the generated report'
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            Response::HTTP_BAD_REQUEST => [
                                'description' => 'Invalid request data',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'error' => [
                                                    'type' => 'string',
                                                    'example' => 'Project ID is required'
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            Response::HTTP_NOT_FOUND => [
                                'description' => 'Project not found',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'error' => [
                                                    'type' => 'string',
                                                    'example' => 'Project not found'
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
