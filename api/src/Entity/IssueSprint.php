<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Repository\IssueSprintRepository;
use App\State\Sprint\IssueSprintProcessor;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: IssueSprintRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['issue_sprint:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            denormalizationContext: ['groups' => ['issue_sprint:create']],
            security: "is_granted('ROLE_USER')",
            processor: IssueSprintProcessor::class
        ),
        new Delete(
            security: "is_granted('ROLE_USER')",
            processor: IssueSprintProcessor::class
        )
    ]
)]
class IssueSprint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['issue:read:item', 'issue:update', 'issue_sprint:read', 'issue:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'issueSprints')]
    #[Groups(['issue_sprint:create', 'issue_sprint:read'])]
    private ?Issue $issue = null;

    #[ORM\ManyToOne(fetch: 'EAGER', inversedBy: 'issueSprints')]
    #[Groups(['issue:read:item', 'issue:update', 'issue_sprint:create', 'issue_sprint:read', 'issue:read'])]
    #[ApiProperty(readableLink: true)]
    private ?Sprint $sprint = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['issue:read:item', 'issue_sprint:read'])]
    private ?DateTimeImmutable $addedAt = null;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(['issue:read:item', 'issue_sprint:read'])]
    private bool $isArchived = false;

    #[ORM\Column]
    #[Groups(['issue:read:item', 'issue:update', 'issue_sprint:read'])]
    private ?bool $completedInSprint = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIssue(): ?Issue
    {
        return $this->issue;
    }

    public function setIssue(?Issue $issue): static
    {
        $this->issue = $issue;

        return $this;
    }

    public function getSprint(): ?Sprint
    {
        return $this->sprint;
    }

    public function setSprint(?Sprint $sprint): static
    {
        $this->sprint = $sprint;

        return $this;
    }

    public function getAddedAt(): ?DateTimeImmutable
    {
        return $this->addedAt;
    }

    #[ORM\PrePersist]
    public function setAddedAt(): void
    {
        if ($this->addedAt === null) {
            $this->addedAt = new DateTimeImmutable();
        }
    }

    public function isArchived(): bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): static
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    public function isCompletedInSprint(): ?bool
    {
        return $this->completedInSprint;
    }

    public function setCompletedInSprint(bool $completedInSprint): static
    {
        $this->completedInSprint = $completedInSprint;

        return $this;
    }
}
