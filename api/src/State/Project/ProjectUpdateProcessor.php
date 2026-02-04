<?php

namespace App\State\Project;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Project;
use App\Exception\IncorrectProcessorDataException;
use App\Service\SoftDelete\ProjectSoftDeleteService;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class ProjectUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor         $processor,
        private ProjectSoftDeleteService $softDeleteService,
        private HubInterface             $hub,
        private SerializerInterface      $serializer
    )
    {
    }

    /**
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Project
    {
        if (!$data instanceof Project) {
            throw new IncorrectProcessorDataException('ProjectUpdateProcessor can only process Project objects.');
        }

        if ($data->isArchived()) {
            $this->softDeleteService->softDelete($data);
        }

        $this->publishMercureUpdate($data);

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Project $project): void
    {
        $topic = '/projects';
        $json = $this->serializer->serialize($project, 'jsonld', ['groups' => ['project:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
