<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\IssueRepository;
use App\State\Issue\IssueCreateProcessor;
use App\State\Issue\IssueUpdateProcessor;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: IssueRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['issue:read']],
            security: "is_granted('ROLE_USER')",
            filters: [
                'issue.order_filter',
                'issue.search_filter',
                'issue.exact_filter',
                'issue.date_filter',
                'issue.range_filter',
                'issue.exists_filter',
            ],
            parameters: [
                'projectId' => new QueryParameter(filter: new ExactFilter(), property: 'project'),
                'issueStatus' => new QueryParameter(filter: new ExactFilter(), property: 'status'),
                'backlog' => new QueryParameter(),
            ]
        ),
        new Get(
            normalizationContext: ['groups' => ['issue:read', 'issue:read:item']],
            security: "is_granted('ISSUE_VIEW', object)"
        ),
        new Post(
            denormalizationContext: ['groups' => ['issue:create']],
            security: "is_granted('ROLE_USER')",
            processor: IssueCreateProcessor::class
        ),
        new Patch(
            normalizationContext: ['groups' => ['issue:read', 'issue:read:item'], 'enable_max_depth' => true],
            denormalizationContext: ['groups' => ['issue:update']],
            security: "is_granted('ISSUE_EDIT', object)",
            processor: IssueUpdateProcessor::class
        )
    ],
    mercure: true
)]
class Issue
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['issue:read', 'chat:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['issue:read', 'chat:read'])]
    private ?string $key = null;

    #[ORM\Column(length: 255)]
    #[Groups(['issue:read', 'issue:create', 'issue:update', 'chat:read'])]
    private ?string $title = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    #[Assert\Type('integer', message: 'Czas szacowany musi być liczbą całkowitą.')]
    #[Assert\PositiveOrZero(message: 'Czas szacowany musi być nieujemną liczbą minut.')]
    private ?int $estimated = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['issue:read', 'issue:update'])]
    #[Assert\Type('integer', message: 'Przepracowany czas musi być liczbą całkowitą.')]
    #[Assert\PositiveOrZero(message: 'Przepracowany czas musi być nieujemną liczbą minut.')]
    private ?int $loggedTime = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?DateTimeInterface $endDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['issue:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['issue:read'])]
    private ?DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: 'integer', enumType: PriorityEnum::class)]
    private ?PriorityEnum $priority = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?IssueStatus $status = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?IssueType $type = null;

    #[ORM\ManyToOne]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?Resolution $resolution = null;

    #[ORM\ManyToOne(inversedBy: 'issues')]
    #[Groups(['issue:read', 'issue:create', 'issue:update', 'chat:read'])]
    private ?Project $project = null;

    #[ORM\ManyToOne]
    #[Groups(['issue:read'])]
    private ?User $reporter = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'issues')]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private Collection $assignees;

    /**
     * @var Collection<int, Attachment>
     */
    #[ORM\OneToMany(targetEntity: Attachment::class, mappedBy: 'issue')]
    #[Groups(['issue:read:item', 'issue:update'])]
    private Collection $attachments;

    /**
     * @var Collection<int, Comment>
     */
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'issue')]
    #[Groups(['issue:read:item'])]
    private Collection $comments;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'children')]
    #[Groups(['issue:read', 'issue:create', 'issue:update'])]
    private ?self $parentIssue = null;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, inversedBy: 'relatedByIssues')]
    #[Groups(['issue:read:item', 'issue:update'])]
    private Collection $relatedIssues;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, mappedBy: 'relatedIssues')]
    #[Groups(['issue:read:item', 'issue:update'])]
    private Collection $relatedByIssues;

    #[ORM\OneToMany(targetEntity: Issue::class, mappedBy: "parentIssue")]
    #[Groups(['issue:read:item', 'issue:update'])]
    private Collection $children;

    /**
     * @var Collection<int, IssueSprint>
     */
    #[ORM\OneToMany(targetEntity: IssueSprint::class, mappedBy: 'issue')]
    #[Groups(['issue:read:item', 'issue:update', 'issue:read'])]
    private Collection $issueSprints;

    /**
     * @var Collection<int, IssueTag>
     */
    #[ORM\OneToMany(targetEntity: IssueTag::class, mappedBy: 'issue', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['issue:read:item'])]
    #[MaxDepth(1)]
    private Collection $issueTags;

    /**
     * @var Collection<int, IssueCalendarEvent>
     */
    #[ORM\OneToMany(targetEntity: IssueCalendarEvent::class, mappedBy: 'issue', orphanRemoval: true)]
    private Collection $issueCalendarEvents;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(['issue:read', 'issue:update'])]
    private bool $isArchived = false;

    public function __construct()
    {
        $this->assignees = new ArrayCollection();
        $this->attachments = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->relatedIssues = new ArrayCollection();
        $this->relatedByIssues = new ArrayCollection();
        $this->children = new ArrayCollection();
        $this->issueSprints = new ArrayCollection();
        $this->issueTags = new ArrayCollection();
        $this->issueCalendarEvents = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getKey(): ?string
    {
        return $this->key;
    }

    public function setKey(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getEstimated(): ?int
    {
        return $this->estimated;
    }

    public function setEstimated(?int $estimated): static
    {
        $this->estimated = $estimated;

        return $this;
    }

    public function getLoggedTime(): ?int
    {
        return $this->loggedTime;
    }

    public function setLoggedTime(?int $loggedTime): static
    {
        $this->loggedTime = $loggedTime;

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

    public function getStartDate(): ?DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(?DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function setCreatedAtForFixtures(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
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

    public function getPriority(): ?PriorityEnum
    {
        return $this->priority;
    }

    #[Groups(['issue:read'])]
    #[SerializedName('priority')]
    public function getPriorityValue(): ?string
    {
        return $this->priority?->getValue();
    }

    public function setPriority(PriorityEnum $priority): static
    {
        $this->priority = $priority;

        return $this;
    }

    #[Groups(['issue:create', 'issue:update'])]
    #[SerializedName('priority')]
    public function setPriorityFromValue(string $value): static
    {
        $this->priority = PriorityEnum::fromValue($value);

        return $this;
    }

    public function getStatus(): ?IssueStatus
    {
        return $this->status;
    }

    public function setStatus(IssueStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getType(): ?IssueType
    {
        return $this->type;
    }

    public function setType(IssueType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getResolution(): ?Resolution
    {
        return $this->resolution;
    }

    public function setResolution(?Resolution $resolution): static
    {
        $this->resolution = $resolution;

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

    public function getReporter(): ?User
    {
        return $this->reporter;
    }

    public function setReporter(?User $reporter): static
    {
        $this->reporter = $reporter;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getAssignees(): Collection
    {
        return $this->assignees;
    }

    public function addAssignee(User $assignee): static
    {
        if (!$this->assignees->contains($assignee)) {
            $this->assignees->add($assignee);
        }

        return $this;
    }

    public function removeAssignee(User $assignee): static
    {
        $this->assignees->removeElement($assignee);

        return $this;
    }

    /**
     * @return Collection<int, Attachment>
     */
    public function getAttachments(): Collection
    {
        return $this->attachments;
    }

    public function addAttachment(Attachment $attachment): static
    {
        if (!$this->attachments->contains($attachment)) {
            $this->attachments->add($attachment);
            $attachment->setIssue($this);
        }

        return $this;
    }

    public function removeAttachment(Attachment $attachment): static
    {
        if ($this->attachments->removeElement($attachment)) {
            // set the owning side to null (unless already changed)
            if ($attachment->getIssue() === $this) {
                $attachment->setIssue(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Comment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setIssue($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getIssue() === $this) {
                $comment->setIssue(null);
            }
        }

        return $this;
    }

    public function getParentIssue(): ?self
    {
        return $this->parentIssue;
    }

    public function setParentIssue(?self $parentIssue): static
    {
        $this->parentIssue = $parentIssue;

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getRelatedIssues(): Collection
    {
        return $this->relatedIssues;
    }

    public function addRelatedIssue(self $relatedIssue): static
    {
        if (!$this->relatedIssues->contains($relatedIssue)) {
            $this->relatedIssues->add($relatedIssue);
        }

        return $this;
    }

    public function removeRelatedIssue(self $relatedIssue): static
    {
        $this->relatedIssues->removeElement($relatedIssue);

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function addChild(self $child): static
    {
        if (!$this->children->contains($child)) {
            $this->children->add($child);
            $child->setParentIssue($this);
        }

        return $this;
    }

    public function removeChild(self $child): static
    {
        if ($this->children->removeElement($child)) {
            // set the owning side to null (unless already changed)
            if ($child->getParentIssue() === $this) {
                $child->setParentIssue(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getRelatedByIssues(): Collection
    {
        return $this->relatedByIssues;
    }

    public function addRelatedByIssue(self $issue): static
    {
        if (!$this->relatedByIssues->contains($issue)) {
            $this->relatedByIssues->add($issue);
            $issue->addRelatedIssue($this);
        }

        return $this;
    }

    public function removeRelatedByIssue(self $issue): static
    {
        if ($this->relatedByIssues->removeElement($issue)) {
            $issue->removeRelatedIssue($this);
        }

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
            $issueSprint->setIssue($this);
        }

        return $this;
    }

    public function removeIssueSprint(IssueSprint $issueSprint): static
    {
        if ($this->issueSprints->removeElement($issueSprint)) {
            // set the owning side to null (unless already changed)
            if ($issueSprint->getIssue() === $this) {
                $issueSprint->setIssue(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, IssueTag>
     */
    public function getIssueTags(): Collection
    {
        return $this->issueTags;
    }

    public function addIssueTag(IssueTag $issueTag): static
    {
        if (!$this->issueTags->contains($issueTag)) {
            $this->issueTags->add($issueTag);
            $issueTag->setIssue($this);
        }

        return $this;
    }

    public function removeIssueTag(IssueTag $issueTag): static
    {
        if ($this->issueTags->removeElement($issueTag)) {
            // set the owning side to null (unless already changed)
            if ($issueTag->getIssue() === $this) {
                $issueTag->setIssue(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, IssueCalendarEvent>
     */
    public function getIssueCalendarEvents(): Collection
    {
        return $this->issueCalendarEvents;
    }

    public function addIssueCalendarEvent(IssueCalendarEvent $issueCalendarEvent): static
    {
        if (!$this->issueCalendarEvents->contains($issueCalendarEvent)) {
            $this->issueCalendarEvents->add($issueCalendarEvent);
            $issueCalendarEvent->setIssue($this);
        }

        return $this;
    }

    public function removeIssueCalendarEvent(IssueCalendarEvent $issueCalendarEvent): static
    {
        if ($this->issueCalendarEvents->removeElement($issueCalendarEvent)) {
            // set the owning side to null (unless already changed)
            if ($issueCalendarEvent->getIssue() === $this) {
                $issueCalendarEvent->setIssue(null);
            }
        }

        return $this;
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
}
