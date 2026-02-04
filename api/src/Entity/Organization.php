<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\OrganizationRepository;
use App\State\Organization\OrganizationCollectionProvider;
use App\State\Organization\OrganizationCreateProcessor;
use App\State\Organization\OrganizationUpdateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OrganizationRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['organization:read']],
            security: "is_granted('ROLE_USER')",
            provider: OrganizationCollectionProvider::class,
            parameters: [
                'minRole' => new QueryParameter(
                    description: 'Filter organizations by minimum role (MEMBER, ADMIN, or CREATOR)',
                    required: false
                ),
            ]
        ),
        new Get(
            normalizationContext: ['groups' => ['organization:read']],
            security: "is_granted('ORGANIZATION_VIEW', object)"
        ),
        new Post(
            denormalizationContext: ['groups' => ['organization:create']],
            processor: OrganizationCreateProcessor::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['organization:update']],
            security: "is_granted('ORGANIZATION_ADMIN', object)",
            processor: OrganizationUpdateProcessor::class
        )
    ],
    mercure: true
)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
class Organization
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['organization:read', 'project:read'])]
    private ?int $id = null;

    #[Groups(['organization:create', 'organization:read', 'organization:update'])]
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Project>
     */
    #[ORM\OneToMany(targetEntity: Project::class, mappedBy: 'organization', cascade: ['persist', 'remove'])]
    #[Groups(['organization:update'])]
    private Collection $projects;

    /**
     * @var Collection<int, Chat>
     */
    #[ORM\OneToMany(targetEntity: Chat::class, mappedBy: 'organization', cascade: ['persist', 'remove'])]
    #[Groups(['organization:update'])]
    private Collection $chats;

    /**
     * @var Collection<int, OrganizationMember>
     */
    #[ORM\OneToMany(targetEntity: OrganizationMember::class, mappedBy: 'organization')]
    #[Groups(['organization:update'])]
    private Collection $organizationMembers;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(['organization:update'])]
    private bool $isArchived = false;

    public function __construct()
    {
        $this->projects = new ArrayCollection();
        $this->chats = new ArrayCollection();
        $this->organizationMembers = new ArrayCollection();
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

    /**
     * @return Collection<int, Project>
     */
    public function getProjects(): Collection
    {
        return $this->projects;
    }

    public function addProject(Project $project): static
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
            $project->setOrganization($this);
        }

        return $this;
    }

    public function removeProject(Project $project): static
    {
        if ($this->projects->removeElement($project)) {
            // set the owning side to null (unless already changed)
            if ($project->getOrganization() === $this) {
                $project->setOrganization(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, OrganizationMember>
     */
    public function getOrganizationMembers(): Collection
    {
        return $this->organizationMembers;
    }

    public function addOrganizationMember(OrganizationMember $organizationMember): static
    {
        if (!$this->organizationMembers->contains($organizationMember)) {
            $this->organizationMembers->add($organizationMember);
            $organizationMember->setOrganization($this);
        }

        return $this;
    }

    public function removeOrganizationMember(OrganizationMember $organizationMember): static
    {
        if ($this->organizationMembers->removeElement($organizationMember)) {
            // set the owning side to null (unless already changed)
            if ($organizationMember->getOrganization() === $this) {
                $organizationMember->setOrganization(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Chat>
     */
    public function getChats(): Collection
    {
        return $this->chats;
    }

    public function addChat(Chat $chat): static
    {
        if (!$this->chats->contains($chat)) {
            $this->chats->add($chat);
            $chat->setOrganization($this);
        }

        return $this;
    }

    public function removeChat(Chat $chat): static
    {
        if ($this->chats->removeElement($chat)) {
            // set the owning side to null (unless already changed)
            if ($chat->getOrganization() === $this) {
                $chat->setOrganization(null);
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
