<?php

namespace App\Message;

readonly class SyncCalendarToProvider
{
    public function __construct(
        private int    $userId,
        private array  $issueIds,
        private string $provider
    )
    {
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getIssueIds(): array
    {
        return $this->issueIds;
    }

    public function getProvider(): string
    {
        return $this->provider;
    }
}
