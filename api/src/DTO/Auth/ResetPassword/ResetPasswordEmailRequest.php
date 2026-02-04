<?php

namespace App\DTO\Auth\ResetPassword;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\ResetPassword\ResetPasswordEmailProcessor;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/reset-password/send',
            status: 202,
            openapi: new Operation(
                tags: ['Reset Password'],
                summary: 'Send password reset email',
                description: 'Send a password reset email if the user exists.',
            ),
            normalizationContext: ['groups' => ['reset_password:read']],
            denormalizationContext: ['groups' => ['reset_password:write']],
            processor: ResetPasswordEmailProcessor::class,
        ),
    ]
)]
class ResetPasswordEmailRequest
{
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Groups(['reset_password:write'])]
    private ?string $email = null;

    #[Groups('reset_password:read')]
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
