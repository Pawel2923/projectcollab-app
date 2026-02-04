<?php

namespace App\DTO;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\State\CalendarSyncProcessor;
use DateTimeInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: 'calendar/sync',
            status: 200,
            output: CalendarSyncRequest::class,
            processor: CalendarSyncProcessor::class
        )
    ]
)]
class CalendarSyncRequest
{
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['google', 'microsoft-entra-id'])]
    private ?string $provider = null;

    /** @var int[] */
    #[Assert\NotBlank]
    #[Assert\All([
        new Assert\Type('integer'),
    ])]
    private array $issueIds = [];

    private ?string $message = null;

    private ?DateTimeInterface $lastSyncedAt = null;

    public function getProvider(): ?string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): static
    {
        $this->provider = $provider;

        return $this;
    }

    public function getIssueIds(): array
    {
        return $this->issueIds;
    }

    public function setIssueIds(array $issueIds): static
    {
        $this->issueIds = $issueIds;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getLastSyncedAt(): ?DateTimeInterface
    {
        return $this->lastSyncedAt;
    }

    public function setLastSyncedAt(?DateTimeInterface $lastSyncedAt): static
    {
        $this->lastSyncedAt = $lastSyncedAt;

        return $this;
    }
}
