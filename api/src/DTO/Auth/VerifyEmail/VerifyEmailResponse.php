<?php

namespace App\DTO\Auth\VerifyEmail;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Auth\VerifyEmail\VerifyEmailProvider;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/verify-email',
            openapi: new Operation(
                tags: ['Verify Email'],
                summary: 'Verify user email',
                description: 'Endpoint to verify a user\'s email address using a verification link.',
            ),
            provider: VerifyEmailProvider::class,
            parameters: [
                'expires' => new QueryParameter(
                    schema: ['type' => 'integer'],
                    description: 'Expiration timestamp for the verification link',
                    required: true,
                    castToNativeType: true,
                ),
                'id' => new QueryParameter(
                    schema: ['type' => 'integer'],
                    description: 'ID of the user to verify',
                    required: true,
                    castToNativeType: true,
                ),
                'signature' => new QueryParameter(
                    schema: ['type' => 'string'],
                    description: 'Signature of the verification link',
                    required: true,
                ),
                'token' => new QueryParameter(
                    schema: ['type' => 'string'],
                    description: 'Token for additional security',
                    required: true,
                ),
            ]
        )
    ]
)]
class VerifyEmailResponse
{
    private ?string $code;

    private ?bool $isVerified;

    public function __construct(
        ?string $code = null,
        ?bool   $isVerified = null
    )
    {
        $this->code = $code;
        $this->isVerified = $isVerified;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function getIsVerified(): ?bool
    {
        return $this->isVerified;
    }
}
