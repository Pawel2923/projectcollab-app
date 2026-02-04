<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Repository\ChatMemberRepository;
use App\State\ChatMember\ChatMemberInviteProcessor;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ChatMemberRepository::class)]
#[ApiResource(
    operations: [
        new Post(
            security: "is_granted('ROLE_USER')",
            processor: ChatMemberInviteProcessor::class
        )
    ],
    denormalizationContext: ['groups' => ['chatMember:create']]
)]
#[ORM\HasLifecycleCallbacks]
class ChatMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['chat:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'chatMembers')]
    #[Groups(['chat:create', 'chatMember:create'])]
    private ?Chat $chat = null;

    #[ORM\ManyToOne]
    #[Groups(['message:read', 'chat:read', 'chat:read', 'chatMember:create'])]
    private ?User $member = null;

    #[ORM\ManyToOne]
    #[Groups(['chat:read', 'chat:read'])]
    private ?ChatRole $role = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['chat:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

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

    public function getRole(): ?ChatRole
    {
        return $this->role;
    }

    public function setRole(?ChatRole $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    #[ORM\PrePersist]
    public function setJoinedAtValue(): void
    {
        if ($this->joinedAt === null) {
            $this->joinedAt = new DateTimeImmutable();
        }
    }
}
