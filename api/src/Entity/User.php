<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\GetCurrentUser;
use App\Repository\UserRepository;
use App\State\Auth\UserCreateProcessor;
use App\State\Auth\UserPasswordProcessor;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            filters: ['user.search_filter']
        ),
        new Get(requirements: ['id' => '\\d+']),
        new Get(
            uriTemplate: '/users/me',
            controller: GetCurrentUser::class,
            read: false,
        ),
        new Post(
            validationContext: ['groups' => ['Default', 'user:create']],
            processor: UserCreateProcessor::class,
        ),
        new Put(processor: UserPasswordProcessor::class),
        new Patch(processor: UserPasswordProcessor::class),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:create', 'user:update']],
)]
#[UniqueEntity(fields: ['email'], message: 'User with this email already exists', groups: ['user:create', 'user:update'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'message:read', 'chat:read', 'organizationMember:read', 'project:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank, Assert\Email(groups: ['user:create'])]
    #[Groups([
        'user:read',
        'user:create',
        'issue:read',
        'comment:read',
        'projectMember:read',
        'message:read',
        'chat:read',
        'organizationMember:read'
    ])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    /**
     * @var ?string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[Groups(['user:create'])]
    #[Assert\NotBlank(groups: ['user:create'])]
    #[Assert\NotCompromisedPassword(groups: ['user:create', 'user:update'])]
    private ?string $plainPassword = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $registeredAt = null;

    /**
     * @var Collection<int, Sprint>
     */
    #[ORM\OneToMany(targetEntity: Sprint::class, mappedBy: 'createdBy')]
    private Collection $sprints;

    /**
     * @var Collection<int, Issue>
     */
    #[ORM\ManyToMany(targetEntity: Issue::class, mappedBy: 'assignees')]
    private Collection $issues;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['user:read'])]
    private ?bool $isVerified = false;

    /**
     * @var Collection<int, Comment>
     */
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'commenter')]
    private Collection $comments;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'user:read',
        'user:create',
        'issue:read',
        'comment:read',
        'projectMember:read',
        'message:read',
        'chat:read',
        'organizationMember:read'
    ])]
    private ?string $username = null;

    /**
     * @var Collection<int, UserOAuth>
     */
    #[ORM\OneToMany(targetEntity: UserOAuth::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $oauthAccounts;

    public function __construct()
    {
        $this->sprints = new ArrayCollection();
        $this->issues = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->oauthAccounts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string)$this->email;
    }

    /**
     * @return list<string>
     * @see UserInterface
     *
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
    }

    public function getRegisteredAt(): ?DateTimeImmutable
    {
        return $this->registeredAt;
    }

    #[ORM\PrePersist]
    public function setRegisteredAt(): void
    {
        if ($this->registeredAt === null) {
            $this->registeredAt = new DateTimeImmutable();
        }
    }

    /**
     * @return Collection<int, Sprint>
     */
    public function getSprints(): Collection
    {
        return $this->sprints;
    }

    public function addSprint(Sprint $sprint): static
    {
        if (!$this->sprints->contains($sprint)) {
            $this->sprints->add($sprint);
            $sprint->setCreatedBy($this);
        }

        return $this;
    }

    public function removeSprint(Sprint $sprint): static
    {
        if ($this->sprints->removeElement($sprint)) {
            // set the owning side to null (unless already changed)
            if ($sprint->getCreatedBy() === $this) {
                $sprint->setCreatedBy(null);
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

    public function addIssue(Issue $issue): static
    {
        if (!$this->issues->contains($issue)) {
            $this->issues->add($issue);
            $issue->addAssignee($this);
        }

        return $this;
    }

    public function removeIssue(Issue $issue): static
    {
        if ($this->issues->removeElement($issue)) {
            $issue->removeAssignee($this);
        }

        return $this;
    }

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

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
            $comment->setCommenter($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getCommenter() === $this) {
                $comment->setCommenter(null);
            }
        }

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * @return Collection<int, UserOAuth>
     */
    public function getOauthAccounts(): Collection
    {
        return $this->oauthAccounts;
    }

    public function addOauthAccount(UserOAuth $oauthAccount): static
    {
        if (!$this->oauthAccounts->contains($oauthAccount)) {
            $this->oauthAccounts->add($oauthAccount);
            $oauthAccount->setUser($this);
        }

        return $this;
    }

    public function removeOauthAccount(UserOAuth $oauthAccount): static
    {
        if ($this->oauthAccounts->removeElement($oauthAccount)) {
            // set the owning side to null (unless already changed)
            if ($oauthAccount->getUser() === $this) {
                $oauthAccount->setUser(null);
            }
        }

        return $this;
    }
}
