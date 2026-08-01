<?php

namespace App\DTO;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\Entity\Report;
use App\State\Report\ReportGenerateProcessor;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/reports/generate',
            status: 201,
            output: Report::class,
            processor: ReportGenerateProcessor::class,
            normalizationContext: ['groups' => ['report:read']],
            openapi: new Operation(
                summary: 'Generate Report',
                description: 'Generate a project report in specified format (PDF, CSV, or XLSX).'
            )
        )
    ]
)]
class ReportGenerateInput
{
    #[Assert\NotNull(message: 'Project ID is required')]
    public ?int $projectId = null;

    public string $type = 'activity';

    public string $format = 'pdf';

    public ?string $dateFrom = null;

    public ?string $dateTo = null;
}
