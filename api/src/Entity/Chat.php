<?php /** @noinspection ALL */
/** @noinspection ALL */

/** @noinspection ALL */

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\ChatRepository;
use App\State\Chat\ChatCreateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;

#[ORM\Entity(repositoryClass: ChatRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_CHAT_NAME_ORG', fields: ['name', 'organization'])]
#[UniqueEntity(
    fields: ['name', 'organization'],
    message: 'Czat z tą nazwą już istnieje w organizacji.',
    groups: ['chat:create']
)]
#[ApiFilter(SearchFilter::class, properties: ['chatMembers.member' => 'exact'])]
#[ApiResource(operations: [
    new Get(
        normalizationContext: ['groups' => ['chat:read']],
        security: "is_granted('CHAT_VIEW', object)"
    ),
    new GetCollection(
        normalizationContext: ['groups' => ['chat:read']],
        security: "is_granted('ROLE_USER')",
        parameters: [
            'organizationId' => new QueryParameter(filter: new ExactFilter(), property: 'organization'),
            'projectId' => new QueryParameter(filter: new ExactFilter(), property: 'project'),
            'issueId' => new QueryParameter(filter: new ExactFilter(), property: 'issue'),
            'sprintId' => new QueryParameter(filter: new ExactFilter(), property: 'sprint'),
            'chatMembers' => new QueryParameter(filter: new ExactFilter(), property: 'chatMembers')
        ]
    ),
    new Post(
        denormalizationContext: ['groups' => ['chat:create']],
        processor: ChatCreateProcessor::class
    ),
    new Patch(),
    new Delete()
], mercure: true)]
class Chat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['chat:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['chat:create', 'chat:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 20)]
    #[Groups(['chat:create', 'chat:read'])]
    private ?string $type = self::TYPE_GENERAL;

    #[ORM\ManyToOne(inversedBy: 'chats')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['chat:create', 'chat:read'])]
    private ?Organization $organization = null;

    #[ORM\ManyToOne]
    #[Groups(['chat:create', 'chat:read'])]
    private ?Project $project = null;

    #[ORM\ManyToOne]
    #[Groups(['chat:create', 'chat:read'])]
    private ?Issue $issue = null;

    #[ORM\ManyToOne]
    #[Groups(['chat:create', 'chat:read'])]
    private ?Sprint $sprint = null;

    public const string TYPE_GENERAL = 'general';
    public const string TYPE_GROUP = 'group';
    public const string TYPE_DIRECT = 'direct';

    /**
     * @var list<string>
     */
    #[SerializedName('members')]
    #[Groups(['chat:create'])]
    public array $initialMembers = [];

    /**
     * @var Collection<int, ChatMember>
     */
    #[ORM\OneToMany(targetEntity: ChatMember::class, mappedBy: 'chat')]
    #[Groups(['chat:read'])]
    private Collection $chatMembers;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'chat')]
    private Collection $messages;

    #[ORM\Column(options: ['default' => false])]
    private bool $isArchived = false;

    public function __construct()
    {
        $this->chatMembers = new ArrayCollection();
        $this->messages = new ArrayCollection();
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

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

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

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

    public function getSprint(): ?Sprint
    {
        return $this->sprint;
    }

    public function setSprint(?Sprint $sprint): static
    {
        $this->sprint = $sprint;

        return $this;
    }

    /**
     * @return Collection<int, ChatMember>
     */
    public function getChatMembers(): Collection
    {
        return $this->chatMembers;
    }

    public function addChatMember(ChatMember $chatMember): static
    {
        if (!$this->chatMembers->contains($chatMember)) {
            $this->chatMembers->add($chatMember);
            $chatMember->setChat($this);
        }

        return $this;
    }

    public function removeChatMember(ChatMember $chatMember): static
    {
        if ($this->chatMembers->removeElement($chatMember)) {
            // set the owning side to null (unless already changed)
            if ($chatMember->getChat() === $this) {
                $chatMember->setChat(null);
            }
        }

        return $this;
    }

    public function getInitialMembers(): array
    {
        return $this->initialMembers;
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

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function setMessages(Collection $messages): void
    {
        $this->messages = $messages;
    }
}
