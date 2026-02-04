<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\RoleChangeLogRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: RoleChangeLogRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['roleChangeLog:read']],
            security: "is_granted('ROLE_ADMIN')"
        )
    ]
)]
#[ORM\HasLifecycleCallbacks]
class RoleChangeLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['roleChangeLog:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['roleChangeLog:read'])]
    private ?string $entityType = null;

    #[ORM\Column]
    #[Groups(['roleChangeLog:read'])]
    private ?int $entityId = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['roleChangeLog:read'])]
    private ?User $member = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['roleChangeLog:read'])]
    private ?string $oldRole = null;

    #[ORM\Column(length: 255)]
    #[Groups(['roleChangeLog:read'])]
    private ?string $newRole = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['roleChangeLog:read'])]
    private ?User $changedBy = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['roleChangeLog:read'])]
    private ?DateTimeImmutable $changedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(string $entityType): static
    {
        $this->entityType = $entityType;

        return $this;
    }

    public function getEntityId(): ?int
    {
        return $this->entityId;
    }

    public function setEntityId(int $entityId): static
    {
        $this->entityId = $entityId;

        return $this;
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

    public function getOldRole(): ?string
    {
        return $this->oldRole;
    }

    public function setOldRole(?string $oldRole): static
    {
        $this->oldRole = $oldRole;

        return $this;
    }

    public function getNewRole(): ?string
    {
        return $this->newRole;
    }

    public function setNewRole(string $newRole): static
    {
        $this->newRole = $newRole;

        return $this;
    }

    public function getChangedBy(): ?User
    {
        return $this->changedBy;
    }

    public function setChangedBy(?User $changedBy): static
    {
        $this->changedBy = $changedBy;

        return $this;
    }

    public function getChangedAt(): ?DateTimeImmutable
    {
        return $this->changedAt;
    }

    #[ORM\PrePersist]
    public function setChangedAt(): void
    {
        if ($this->changedAt === null) {
            $this->changedAt = new DateTimeImmutable();
        }
    }
}
