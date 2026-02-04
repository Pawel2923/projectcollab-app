<?php

namespace App\DTO\Auth;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\UserOAuthProvider;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/users/me/oauth',
            openapi: new Operation(
                tags: ['User'],
                summary: 'Get user OAuth providers',
                description: 'Get user OAuth providers',

            ),
            provider: UserOAuthProvider::class,
        )
    ],
)]
class UserOAuthProviders
{
    /**
     * @var string[]
     */
    private array $providers = [];

    public function getProviders(): array
    {
        return $this->providers;
    }

    public function setProviders(array $providers): void
    {
        $this->providers = $providers;
    }

    private ?string $lastSyncedAt = null;

    public function getLastSyncedAt(): ?string
    {
        return $this->lastSyncedAt;
    }

    public function setLastSyncedAt(?string $lastSyncedAt): void
    {
        $this->lastSyncedAt = $lastSyncedAt;
    }
}
