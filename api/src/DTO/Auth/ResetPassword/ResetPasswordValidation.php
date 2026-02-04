<?php

namespace App\DTO\Auth\ResetPassword;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\ResetPassword\ResetPasswordValidationProvider;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/reset-password/validate',
            openapi: new Operation(
                tags: ['Reset Password'],
                summary: 'Validate reset password token',
                description: 'Validate a password reset token and return validation status.',
            ),
            provider: ResetPasswordValidationProvider::class,
            parameters: [
                'token' => new QueryParameter(
                    schema: ['type' => 'string'],
                    description: 'Password reset token to validate',
                    required: false,
                ),
                'reset_token' => new QueryParameter(
                    schema: ['type' => 'string'],
                    description: 'Password reset token to validate (alternative parameter name)',
                    required: false,
                ),
            ]
        )
    ]
)]
class ResetPasswordValidation
{
    private ?string $code;
    private ?bool $isValid;
    private ?string $token;

    public function __construct(
        ?string $code = null,
        ?bool   $isValid = null,
        ?string $token = null
    )
    {
        $this->code = $code;
        $this->isValid = $isValid;
        $this->token = $token;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function getIsValid(): ?bool
    {
        return $this->isValid;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }
}
