<?php

namespace App\State\Sprint;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Sprint;
use App\Entity\SprintStatusEnum;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use Doctrine\ORM\EntityManagerInterface;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class SprintProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security               $security,
        private LoggerInterface        $logger,
        private HubInterface           $hub,
        private SerializerInterface    $serializer
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

        if (!$data->getCreatedBy()) {
            /** @var ?User $user */
            $user = $this->security->getUser();
            if ($user) {
                $data->setCreatedBy($user);
            }
        }

        if (!$data->getProject()) {
            $this->logger->error('SprintProcessor: project is not set', [
                'sprint_name' => $data->getName(),
            ]);
            throw new InvalidArgumentException('Project must be set for sprint creation');
        }

        if (!$data->getStatus()) {
            $data->setStatus(SprintStatusEnum::CREATED);
        }

        if ($data->isArchived() === null) {
            $data->setIsArchived(false);
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        $this->publishMercureUpdate($data);

        return $data;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Sprint $sprint): void
    {
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
