<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\OrganizationMemberRepository;
use App\State\OrganizationMember\OrganizationMemberCreateProcessor;
use App\State\OrganizationMember\OrganizationMemberDeleteProcessor;
use App\State\OrganizationMember\OrganizationMemberUpdateProcessor;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OrganizationMemberRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_ORG_MEMBER', fields: ['organization', 'member'])]
#[UniqueEntity(
    fields: ['organization', 'member'],
    message: 'This user is already a member of this organization.',
    errorPath: 'member'
)]
#[ApiResource(
    operations: [
        new Get(
            parameters: [
                'organizationId' => new QueryParameter(filter: new ExactFilter(), property: 'organization')
            ]
        ),
        new GetCollection(
            parameters: [
                'organizationId' => new QueryParameter(filter: new ExactFilter(), property: 'organization')
            ]
        ),
        new Post(
            denormalizationContext: ['groups' => ['organizationMember:create']],
            processor: OrganizationMemberCreateProcessor::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['organizationMember:update']],
            security: "is_granted('ORGANIZATION_ADMIN', object.getOrganization())",
            processor: OrganizationMemberUpdateProcessor::class
        ),
        new Delete(
            security: "is_granted('ORGANIZATION_EDIT', object.getOrganization())",
            processor: OrganizationMemberDeleteProcessor::class
        )
    ],
    normalizationContext: ['groups' => 'organizationMember:read'],
)]
#[ORM\HasLifecycleCallbacks]
class OrganizationMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['organizationMember:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(['organizationMember:read', 'organizationMember:create'])]
    private ?User $member = null;

    #[ORM\ManyToOne(inversedBy: 'organizationMembers')]
    #[Groups(['organizationMember:read', 'organizationMember:create'])]
    private ?Organization $organization = null;

    #[ORM\ManyToOne]
    #[Groups(['organizationMember:read', 'organizationMember:update'])]
    private ?OrganizationRole $role = null;

    #[ORM\Column]
    #[Groups(['organizationMember:read'])]
    private ?bool $isBlocked = null;

    #[ORM\ManyToOne]
    #[Groups(['organizationMember:read'])]
    private ?User $invitedBy = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['organizationMember:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMember(): ?User
    {
        return $this->member;
    }

    public function setMember(?User $member): static
    {
        $this->member = $member;

        return $this;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): static
    {
        $this->organization = $organization;

        return $this;
    }

    public function getRole(): ?OrganizationRole
    {
        return $this->role;
    }

    public function setRole(?OrganizationRole $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function isBlocked(): ?bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(bool $isBlocked): static
    {
        $this->isBlocked = $isBlocked;

        return $this;
    }

    public function getInvitedBy(): ?User
    {
        return $this->invitedBy;
    }

    public function setInvitedBy(?User $invitedBy): static
    {
        $this->invitedBy = $invitedBy;

        return $this;
    }

    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    #[ORM\PrePersist]
    public function setJoinedAt(): void
    {
        if ($this->joinedAt === null) {
            $this->joinedAt = new DateTimeImmutable();
        }
    }
}
