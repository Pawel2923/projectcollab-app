<?php

namespace App\State\OrganizationMember;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\OrganizationMember;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class OrganizationMemberUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface  $processor,
        private Security            $security,
        private HubInterface        $hub,
        private SerializerInterface $serializer,
    )
    {
    }

    /**
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): OrganizationMember
    {
        if (!$data instanceof OrganizationMember) {
            throw new InvalidArgumentException('Expected OrganizationMember entity');
        }

        $user = $this->security->getUser();
        if (!$user) {
            throw new RuntimeException('User not authenticated');
        }

        // Check if user has ORGANIZATION_EDIT permission
        if (!$this->security->isGranted('ORGANIZATION_EDIT', $data->getOrganization())) {
            throw new RuntimeException('Access denied: Insufficient permissions');
        }

        // If role is being changed, perform additional checks
        if (isset($context['previous_data']) && $context['previous_data'] instanceof OrganizationMember) {
            $previousRole = $context['previous_data']->getRole()->getValue();
            $newRole = $data->getRole()->getValue();

            // CREATOR role can only be changed by organization ADMIN
            if ($previousRole === 'CREATOR' && $newRole !== 'CREATOR') {
                if (!$this->security->isGranted('ORGANIZATION_ADMIN', $data->getOrganization())) {
                    throw new RuntimeException('Only organization admins can change creator role');
                }
            }
        }

        /** @var OrganizationMember $result */
        $result = $this->processor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(OrganizationMember $member): void
    {
        if (!$member->getOrganization()) {
            return;
        }

        $orgId = $member->getOrganization()->getId();
        $topic = "/organization_members?organizationId=$orgId";
        $json = $this->serializer->serialize($member, 'jsonld', ['groups' => ['organization_member:read']]);

        $update = new Update(
            $topic,
            $json,
            false
        );

        $this->hub->publish($update);
    }
}
