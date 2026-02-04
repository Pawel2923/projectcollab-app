<?php

namespace App\State\Sprint;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Sprint;
use App\Exception\IncorrectProcessorDataException;
use App\Service\SoftDelete\SprintSoftDeleteService;
use DateTime;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class SprintUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private LoggerInterface          $logger,
        private PersistProcessor         $processor,
        private HubInterface             $hub,
        private SerializerInterface      $serializer,
        private SprintSoftDeleteService  $softDeleteService
    )
    {
    }

    /** @param Sprint|object $data
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): object
    {
        if (!$data instanceof Sprint) {
            $this->logger->error('SprintProcessor: data is not instance of Sprint', [
                'data_instanceof' => $data,
            ]);
            throw new IncorrectProcessorDataException();
        }

        if ($data->isArchived()) {
            $this->softDeleteService->softDelete($data);
        }

        $data->setUpdatedAt(new DateTime());

        /** @var Sprint $result */
        $result = $this->processor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Sprint $sprint): void
    {
        if ($sprint->getProject()) {
            $projectId = $sprint->getProject()->getId();
            $topic = '/sprints?project=' . $projectId;

            $json = $this->serializer->serialize($sprint, 'jsonld', ['groups' => ['sprint:read']]);

            $update = new Update(
                $topic,
                $json,
                false
            );

            $this->hub->publish($update);
        }
    }
}
