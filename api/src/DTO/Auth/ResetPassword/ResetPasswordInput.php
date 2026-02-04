<?php

namespace App\DTO\Auth\ResetPassword;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\ResetPassword\ResetPasswordProcessor;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/reset-password/reset',
            status: 204,
            openapi: new Operation(
                tags: ['Reset Password'],
                summary: 'Reset password',
                description: 'Reset user password using a valid reset token.',
            ),
            normalizationContext: ['groups' => ['reset_password_input:read']],
            denormalizationContext: ['groups' => ['reset_password_input:write']],
            processor: ResetPasswordProcessor::class,
        ),
    ]
)]
class ResetPasswordInput
{
    #[Assert\NotBlank]
    #[Assert\NotCompromisedPassword]
    #[Groups(['reset_password_input:write'])]
    private ?string $plainPassword = null;

    #[Assert\NotBlank]
    #[Groups(['reset_password_input:write'])]
    private ?string $token = null;

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): void
    {
        $this->plainPassword = $plainPassword;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): void
    {
        $this->token = $token;
    }
}
