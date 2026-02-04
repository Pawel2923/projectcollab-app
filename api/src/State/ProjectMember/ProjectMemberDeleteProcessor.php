<?php

namespace App\State\ProjectMember;

use ApiPlatform\Doctrine\Common\State\RemoveProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ProjectMember;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

readonly class ProjectMemberDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private RemoveProcessor $removeProcessor,
        private HubInterface    $hub,
    )
    {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        if (!$data instanceof ProjectMember) {
            return;
        }

        $projectId = $data->getProject()?->getId();

        $this->removeProcessor->process($data, $operation, $uriVariables, $context);

        if ($projectId) {
            $this->publishMercureUpdate($projectId, $data);
        }
    }

    private function publishMercureUpdate(int $projectId, ProjectMember $member): void
    {
        $topic = "/project_members?projectId=$projectId";
        $json = json_encode(['@id' => "/project_members/{$member->getId()}", 'status' => 'deleted']);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
