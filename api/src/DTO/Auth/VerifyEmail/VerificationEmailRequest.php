<?php

namespace App\DTO\Auth\VerifyEmail;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\VerifyEmail\VerificationEmailProcessor;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/verify-email/send',
            status: 202,
            openapi: new Operation(
                tags: ['Verify Email'],
                summary: 'Send verification email',
                description: 'Send a verification email if the user exists and is not verified.',
            ),
            normalizationContext: ['groups' => ['verification:read']],
            denormalizationContext: ['groups' => ['verification:write']],
            processor: VerificationEmailProcessor::class,
        ),
    ]
)]
class VerificationEmailRequest
{
    #[Assert\Email]
    #[Assert\NotBlank]
    #[Groups(['verification:write'])]
    private ?string $email = null;

    #[Groups('verification:read')]
    private ?string $code = null;

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): void
    {
        $this->code = $code;
    }
}
