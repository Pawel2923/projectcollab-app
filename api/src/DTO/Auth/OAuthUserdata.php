<?php

namespace App\DTO\Auth;

use League\OAuth2\Client\Provider\ResourceOwnerInterface;

class OAuthUserdata implements ResourceOwnerInterface
{
    private string $id;
    private ?string $email = null;
    private ?string $name = null;
    private ?string $avatarUrl = null;
    private array $data = [];

    public function fromResourceOwner(ResourceOwnerInterface $owner): self
    {
        $data = $owner->toArray();
        $email = null;
        if (method_exists($owner, 'getEmail')) {
            $email = $owner->getEmail();
        }

        if (!$email && method_exists($owner, 'getUpn')) {
            $email = $owner->getUpn();
        }

        if (!$email && isset($data['email'])) {
            $email = $data['email'];
        }

        if (!$email && isset($data['userPrincipalName'])) {
            $email = $data['userPrincipalName'];
        }

        if (!$email && isset($data['mail'])) {
            $email = $data['mail'];
        }

        $name = null;
        if (method_exists($owner, 'getName')) {
            $name = $owner->getName();
        } elseif (isset($data['name'])) {
            $name = $data['name'];
        } elseif (isset($data['displayName'])) {
            $name = $data['displayName'];
        }

        $avatarUrl = null;
        if (method_exists($owner, 'getAvatar')) {
            $avatarUrl = $owner->getAvatar();
        } elseif (isset($data['picture'])) {
            $avatarUrl = $data['picture'];
        } elseif (isset($data['avatar_url'])) {
            $avatarUrl = $data['avatar_url'];
        }

        $this->id = (string)$owner->getId();
        $this->email = $email;
        $this->name = $name;
        $this->avatarUrl = $avatarUrl;
        $this->data = $data;

        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function toArray(): array
    {
        return $this->data;
    }
}
