<?php

namespace App\Entity;

use App\Repository\IssueCalendarEventRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IssueCalendarEventRepository::class)]
class IssueCalendarEvent
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'issueCalendarEvents')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Issue $issue = null;

    #[ORM\Column(length: 50)]
    private ?string $provider = null;

    #[ORM\Column(length: 255)]
    private ?string $externalEventId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $externalHtmlLink = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $lastSyncedAt = null;

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

    public function getProvider(): ?string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): static
    {
        $this->provider = $provider;

        return $this;
    }

    public function getExternalEventId(): ?string
    {
        return $this->externalEventId;
    }

    public function setExternalEventId(string $externalEventId): static
    {
        $this->externalEventId = $externalEventId;

        return $this;
    }

    public function getExternalHtmlLink(): ?string
    {
        return $this->externalHtmlLink;
    }

    public function setExternalHtmlLink(?string $externalHtmlLink): static
    {
        $this->externalHtmlLink = $externalHtmlLink;

        return $this;
    }

    public function getLastSyncedAt(): ?DateTimeImmutable
    {
        return $this->lastSyncedAt;
    }

    public function setLastSyncedAt(DateTimeImmutable $lastSyncedAt): static
    {
        $this->lastSyncedAt = $lastSyncedAt;

        return $this;
    }
}
