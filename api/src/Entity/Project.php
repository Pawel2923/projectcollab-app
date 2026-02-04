<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\ProjectRepository;
use App\State\Project\ProjectCollectionProvider;
use App\State\Project\ProjectProcessor;
use App\State\Project\ProjectUpdateProcessor;
use ApiPlatform\Metadata\Patch;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/projects',
            normalizationContext: ['groups' => ['project:read']],
            security: "is_granted('ROLE_USER')",
            provider: ProjectCollectionProvider::class,
            parameters: [
                'organizationId' => new QueryParameter(filter: new ExactFilter(), property: 'organization', required: true),
            ]
        ),
        new Get(normalizationContext: ['groups' => ['project:read']], security: "is_granted('PROJECT_VIEW', object)"),
        new Post(denormalizationContext: ['groups' => ['project:create']], processor: ProjectProcessor::class),
        new Patch(
            denormalizationContext: ['groups' => ['project:update']],
            security: "is_granted('PROJECT_EDIT', object)",
            processor: ProjectUpdateProcessor::class
        ),
    ],
    mercure: true
)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['project:read', 'chat:read'])]
    private ?int $id = null;

    #[Groups(['project:create', 'project:read', 'chat:read'])]
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups(['project:read', 'project:update'])]
    private bool $isArchived = false;

    /**
     * @var Collection<int, Sprint>
     */
    #[ORM\OneToMany(targetEntity: Sprint::class, mappedBy: 'project')]
    private Collection $sprints;

    /**
     * @var Collection<int, Issue>
     */
    #[ORM\OneToMany(targetEntity: Issue::class, mappedBy: 'project')]
    private Collection $issues;

    #[Groups(['project:read', 'project:create', 'chat:read'])]
    #[ORM\ManyToOne(targetEntity: Organization::class, inversedBy: 'projects')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Organization $organization = null;

    /**
     * @var Collection<int, ProjectMember>
     */
    #[ORM\OneToMany(targetEntity: ProjectMember::class, mappedBy: 'project')]
    #[Groups(['project:read'])]
    private Collection $projectMembers;

    #[ORM\OneToOne(targetEntity: ProjectSequence::class, mappedBy: 'projectId', cascade: ['persist', 'remove'])]
    private ?ProjectSequence $projectSequence = null;

    /**
     * @var Collection<int, Report>
     */
    #[ORM\OneToMany(targetEntity: Report::class, mappedBy: 'project')]
    private Collection $reports;

    #[Groups('project:create')]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nameAbbreviation = null;

    public function __construct()
    {
        $this->sprints = new ArrayCollection();
        $this->issues = new ArrayCollection();
        $this->projectMembers = new ArrayCollection();
        $this->reports = new ArrayCollection();
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

    public function isArchived(): ?bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): static
    {
        $this->isArchived = $isArchived;

        return $this;
    }

    /**
     * @return Collection<int, Sprint>
     */
    public function getSprints(): Collection
    {
        return $this->sprints;
    }

    public function addSprint(Sprint $sprints): static
    {
        if (!$this->sprints->contains($sprints)) {
            $this->sprints->add($sprints);
            $sprints->setProject($this);
        }

        return $this;
    }

    public function removeSprint(Sprint $sprints): static
    {
        if ($this->sprints->removeElement($sprints)) {
            // set the owning side to null (unless already changed)
            if ($sprints->getProject() === $this) {
                $sprints->setProject(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Issue>
     */
    public function getIssues(): Collection
    {
        return $this->issues;
    }

    public function addIssue(Issue $issues): static
    {
        if (!$this->issues->contains($issues)) {
            $this->issues->add($issues);
            $issues->setProject($this);
        }

        return $this;
    }

    public function removeIssue(Issue $issues): static
    {
        if ($this->issues->removeElement($issues)) {
            // set the owning side to null (unless already changed)
            if ($issues->getProject() === $this) {
                $issues->setProject(null);
            }
        }

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

    /**
     * @return Collection<int, ProjectMember>
     */
    public function getProjectMembers(): Collection
    {
        return $this->projectMembers;
    }

    public function addProjectMember(ProjectMember $projectMember): static
    {
        if (!$this->projectMembers->contains($projectMember)) {
            $this->projectMembers->add($projectMember);
            $projectMember->setProject($this);
        }

        return $this;
    }

    public function removeProjectMember(ProjectMember $projectMember): static
    {
        if ($this->projectMembers->removeElement($projectMember)) {
            // set the owning side to null (unless already changed)
            if ($projectMember->getProject() === $this) {
                $projectMember->setProject(null);
            }
        }

        return $this;
    }

    public function getProjectSequence(): ?ProjectSequence
    {
        return $this->projectSequence;
    }

    public function setProjectSequence(ProjectSequence $projectSequence): static
    {
        $this->projectSequence = $projectSequence;

        return $this;
    }

    public function getNameAbbreviation(): ?string
    {
        return $this->nameAbbreviation;
    }

    public function setNameAbbreviation(?string $nameAbbreviation): static
    {
        $this->nameAbbreviation = $nameAbbreviation;

        return $this;
    }

    /**
     * @return Collection<int, Report>
     */
    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Report $report): static
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
            $report->setProject($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getProject() === $this) {
                $report->setProject(null);
            }
        }

        return $this;
    }
}
