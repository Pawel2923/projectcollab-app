<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Controller\CreateAttachmentController;
use App\Repository\AttachmentRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AttachmentRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            controller: CreateAttachmentController::class,
            security: "is_granted('ROLE_USER')",
            validationContext: ['groups' => ['Default', 'attachment:create']],
            deserialize: false
        ),
        new Delete(
            security: "is_granted('ROLE_USER')"
        )
    ],
    normalizationContext: ['groups' => ['attachment:read']],
    denormalizationContext: ['groups' => ['attachment:create']],
)]
class Attachment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['attachment:read', 'issue:read:item'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['attachment:read', 'issue:read:item'])]
    private ?string $path = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['attachment:read', 'issue:read:item'])]
    private ?DateTimeImmutable $uploadedAt = null;

    #[ORM\ManyToOne(inversedBy: 'attachments')]
    #[Groups(['attachment:read', 'attachment:create'])]
    private ?Issue $issue = null;

    public ?File $file = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

        return $this;
    }

    public function getUploadedAt(): ?DateTimeImmutable
    {
        return $this->uploadedAt;
    }

    #[ORM\PrePersist]
    public function setUploadedAt(): void
    {
        if ($this->uploadedAt === null) {
            $this->uploadedAt = new DateTimeImmutable();
        }
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
}
