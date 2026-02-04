<?php

namespace App\Security;

use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Throwable;

readonly class ProviderService
{
    public function __construct(
        private ClientRegistry $clientRegistry,
    )
    {
    }

    /**
     * @param string $provider
     * @return OAuth2ClientInterface
     * @throws CustomUserMessageAuthenticationException
     */
    public function getProviderClient(string $provider): OAuth2ClientInterface
    {
        try {
            return $this->clientRegistry->getClient($provider);
        } catch (Throwable $th) {
            error_log('OAuth Client Error: ' . $th->getMessage());
            throw new CustomUserMessageAuthenticationException("Provider $provider not supported");
        }
    }
}
