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
use App\Repository\SprintRepository;
use App\State\Sprint\SprintDeleteProcessor;
use App\State\Sprint\SprintProcessor;
use App\State\Sprint\SprintUpdateProcessor;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SprintRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['sprint:read']],
            security: "is_granted('ROLE_USER')",
            parameters: [
                'project' => new QueryParameter(filter: new ExactFilter(), property: 'project'),
                'status' => new QueryParameter(filter: new ExactFilter(), property: 'status'),
            ]
        ),
        new Get(
            normalizationContext: ['groups' => ['sprint:read']],
            security: "is_granted('SPRINT_VIEW', object)"
        ),
        new Post(
            normalizationContext: ['groups' => ['sprint:read']],
            denormalizationContext: ['groups' => ['sprint:create']],
            security: "is_granted('ROLE_USER')",
            validationContext: ['groups' => ['Default', 'sprint:create']],
            processor: SprintProcessor::class
        ),
        new Patch(
            normalizationContext: ['groups' => ['sprint:read']],
            denormalizationContext: ['groups' => ['sprint:update']],
            security: "is_granted('SPRINT_EDIT', object)",
            processor: SprintUpdateProcessor::class
        ),
        new Delete(
            security: "is_granted('SPRINT_DELETE', object)",
            processor: SprintDeleteProcessor::class
        )
    ]
)]
class Sprint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['sprint:read', 'chat:read', 'issue:read:item'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update', 'issue:read:item', 'issue:update', 'chat:read'])]
    #[Assert\NotBlank(message: 'Sprint name is required', groups: ['sprint:create'])]
    #[Assert\Length(min: 1, max: 255, groups: ['sprint:create', 'sprint:update'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update'])]
    private ?string $goal = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['sprint:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['sprint:read'])]
    private ?DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update'])]
    #[Assert\NotBlank(message: 'Start date is required', groups: ['sprint:create'])]
    #[Assert\GreaterThanOrEqual('now', message: 'Start date cannot be in the past', groups: ['sprint:create'])]
    private ?DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update'])]
    #[Assert\NotBlank(message: 'End date is required', groups: ['sprint:create'])]
    #[Assert\GreaterThan(propertyPath: 'startDate', message: 'End date must be after start date', groups: ['sprint:create'])]
    private ?DateTimeInterface $endDate = null;

    #[ORM\Column(type: 'string', enumType: SprintStatusEnum::class)]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update'])]
    private ?SprintStatusEnum $status = null;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(['sprint:read', 'sprint:create', 'sprint:update', 'issue:read:item', 'issue:read'])]
    private bool $isArchived = false;

    #[ORM\ManyToOne(inversedBy: 'sprints')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['sprint:read'])]
    private ?User $createdBy = null;

    #[ORM\ManyToOne(inversedBy: 'sprints')]
    #[Groups(['sprint:read', 'sprint:create', 'chat:read'])]
    private ?Project $project = null;

    /**
     * @var Collection<int, IssueSprint>
     */
    #[ORM\OneToMany(targetEntity: IssueSprint::class, mappedBy: 'sprint')]
    #[Ignore]
    private Collection $issueSprints;

    public function __construct()
    {
        $this->issueSprints = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getGoal(): ?string
    {
        return $this->goal;
    }

    public function setGoal(?string $goal): static
    {
        $this->goal = $goal;

        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAt(): void
    {
        if ($this->createdAt === null) {
            $this->createdAt = new DateTimeImmutable();
        }
    }

    public function getUpdatedAt(): ?DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getStartDate(): ?DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(?DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(?DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getStatus(): ?SprintStatusEnum
    {
        return $this->status;
    }

    public function setStatus(SprintStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    #[Groups(['sprint:read', 'sprint:create', 'sprint:update', 'issue:read:item', 'issue:read'])]
    #[SerializedName('isArchived')]
    public function isArchived(): bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): static
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

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

    /**
     * @return Collection<int, IssueSprint>
     */
    public function getIssueSprints(): Collection
    {
        return $this->issueSprints;
    }

    public function addIssueSprint(IssueSprint $issueSprint): static
    {
        if (!$this->issueSprints->contains($issueSprint)) {
            $this->issueSprints->add($issueSprint);
            $issueSprint->setSprint($this);
        }

        return $this;
    }

    public function removeIssueSprint(IssueSprint $issueSprint): static
    {
        if ($this->issueSprints->removeElement($issueSprint)) {
            // set the owning side to null (unless already changed)
            if ($issueSprint->getSprint() === $this) {
                $issueSprint->setSprint(null);
            }
        }

        return $this;
    }
}
