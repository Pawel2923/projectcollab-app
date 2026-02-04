<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Filter\IssueTagFilter;
use App\Repository\TagRepository;
use App\State\TagProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\SerializedName;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;

#[ORM\Entity(repositoryClass: TagRepository::class)]
#[ORM\Index(name: 'idx_tag_title', fields: ['title'])]
#[UniqueEntity(fields: ['title'])]
#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_USER')",
            parameters: [
                'issueId' => new QueryParameter(filter: new IssueTagFilter())
            ]
        ),
        new Get(
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            security: "is_granted('ROLE_USER')"
        ),
        new Patch(
            security: "is_granted('ROLE_USER')"
        )
    ],
    normalizationContext: ['groups' => ['tag:read']],
    processor: TagProcessor::class
)]
class Tag
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['tag:read', 'issue:read:item'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['tag:read', 'issue:read:item'])]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['tag:read', 'issue:read:item'])]
    private ?string $backgroundColor = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['tag:read', 'issue:read:item'])]
    private ?string $textColor = null;

    /**
     * @var Collection<int, IssueTag>
     */
    #[ORM\OneToMany(targetEntity: IssueTag::class, mappedBy: 'tag', cascade: ['persist'])]
    #[Groups(['tag:read'])]
    #[MaxDepth(1)]
    private Collection $issueTags;

    #[SerializedName('issue')]
    #[Groups(['tag:read'])]
    private ?Issue $issue = null;

    #[ORM\Column]
    private bool $isArchived = false;

    public function __construct()
    {
        $this->issueTags = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getBackgroundColor(): ?string
    {
        return $this->backgroundColor;
    }

    public function setBackgroundColor(?string $backgroundColor): static
    {
        $this->backgroundColor = $backgroundColor;

        return $this;
    }

    public function getTextColor(): ?string
    {
        return $this->textColor;
    }

    public function setTextColor(?string $textColor): static
    {
        $this->textColor = $textColor;

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
            $issueTag->setTag($this);
        }

        return $this;
    }

    public function removeIssueTag(IssueTag $issueTag): static
    {
        if ($this->issueTags->removeElement($issueTag)) {
            // set the owning side to null (unless already changed)
            if ($issueTag->getTag() === $this) {
                $issueTag->setTag(null);
            }
        }

        return $this;
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
