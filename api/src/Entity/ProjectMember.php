<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\ProjectMemberRepository;
use App\State\ProjectMember\ProjectMemberCreateProcessor;
use App\State\ProjectMember\ProjectMemberDeleteProcessor;
use App\State\ProjectMember\ProjectMemberUpdateProcessor;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProjectMemberRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['projectMember:read']],
            parameters: [
                'projectId' => new QueryParameter(filter: new ExactFilter(), property: 'project'),
            ]
        ),
        new Post(
            denormalizationContext: ['groups' => ['projectMember:create']],
            processor: ProjectMemberCreateProcessor::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['projectMember:update']],
            security: "is_granted('PROJECT_ADMIN', object.getProject())",
            processor: ProjectMemberUpdateProcessor::class
        ),
        new Delete(
            security: "is_granted('PROJECT_EDIT', object.getProject())",
            processor: ProjectMemberDeleteProcessor::class
        ),
    ]
)]
#[ORM\HasLifecycleCallbacks]
class ProjectMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['projectMember:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[Groups(['projectMember:read', 'projectMember:create', 'project:read'])]
    private ?User $member = null;

    #[ORM\ManyToOne(inversedBy: 'projectMembers')]
    #[Groups(['projectMember:read', 'projectMember:create'])]
    private ?Project $project = null;

    #[ORM\Column]
    #[Groups(['projectMember:read'])]
    private bool $isBlocked = false;

    #[ORM\ManyToOne]
    #[Groups(['projectMember:read'])]
    private ?User $invitedBy = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['projectMember:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['projectMember:read', 'projectMember:create', 'projectMember:update'])]
    private ?ProjectRole $role = null;

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

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

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

    public function getRole(): ?ProjectRole
    {
        return $this->role;
    }

    public function setRole(?ProjectRole $role): static
    {
        $this->role = $role;

        return $this;
    }
}
