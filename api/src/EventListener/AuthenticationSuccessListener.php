<?php

namespace App\EventListener;

use DateMalformedStringException;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\HttpFoundation\Cookie;

readonly class AuthenticationSuccessListener
{
    public function __construct(
        private string $mercureSecret
    )
    {
    }

    /**
     * @throws DateMalformedStringException
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->mercureSecret)
        );

        $now = new DateTimeImmutable();
        $token = $config->builder()
            ->withClaim('mercure', ['subscribe' => ['*']])
            ->expiresAt($now->modify('+1 hour'))
            ->getToken($config->signer(), $config->signingKey());

        $cookie = new Cookie(
            name: 'mercureAuthorization',
            value: $token->toString(),
            expire: $now->modify('+1 hour'),
            path: '/',
            secure: false, // set true if https
            httpOnly: true,
            sameSite: Cookie::SAMESITE_LAX
        );

        $event->getResponse()->headers->setCookie($cookie);
    }
}
