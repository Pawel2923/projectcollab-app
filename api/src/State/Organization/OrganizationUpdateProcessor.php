<?php

namespace App\State\Organization;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Organization;
use App\Exception\IncorrectProcessorDataException;
use App\Service\SoftDelete\OrganizationSoftDeleteService;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class OrganizationUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor              $processor,
        private OrganizationSoftDeleteService $softDeleteService,
        private HubInterface                  $hub,
        private SerializerInterface           $serializer
    )
    {
    }

    /**
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Organization
    {
        if (!$data instanceof Organization) {
            throw new IncorrectProcessorDataException('OrganizationCreateProcessor can only process Organization objects.');
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
    private function publishMercureUpdate(Organization $organization): void
    {
        $topic = '/organizations';
        $json = $this->serializer->serialize($organization, 'jsonld', ['groups' => ['organization:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
