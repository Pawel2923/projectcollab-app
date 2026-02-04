<?php

namespace App\State\OrganizationMember;

use ApiPlatform\Doctrine\Common\State\RemoveProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\OrganizationMember;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

readonly class OrganizationMemberDeleteProcessor implements ProcessorInterface
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
        if (!$data instanceof OrganizationMember) {
            return;
        }

        $orgId = $data->getOrganization()?->getId();

        $this->removeProcessor->process($data, $operation, $uriVariables, $context);

        if ($orgId) {
            $this->publishMercureUpdate($orgId, $data);
        }
    }

    private function publishMercureUpdate(int $orgId, OrganizationMember $member): void
    {
        $topic = "/organization_members?organizationId=$orgId";
        $json = json_encode(['@id' => "/organization_members/{$member->getId()}", 'status' => 'deleted']);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
