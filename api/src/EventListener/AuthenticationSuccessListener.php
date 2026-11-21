<?php

namespace App\EventListener;

use DateMalformedStringException;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RequestStack;

readonly class AuthenticationSuccessListener
{
    public function __construct(
        private string $mercureSecret,
        private RequestStack $requestStack,
        private string $cookieDomain = '',
    ) {
    }

    /**
     * Sets the Mercure authorization cookie on every successful JWT authentication.
     *
     * The access-token cookie is handled automatically by LexikJWT via `set_cookies` config.
     * The refresh-token cookie is handled automatically by gesdinet via `cookie:` config.
     *
     * Both `token` and `refresh_token` are kept in the JSON response body for backward
     * compatibility with the /frontend Next.js application.
     * @deprecated Body tokens will be removed once /frontend is fully migrated to /spa.
     *
     * @throws DateMalformedStringException
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $request  = $this->requestStack->getCurrentRequest();
        $isSecure = $request?->isSecure() ?? false;
        $now      = new DateTimeImmutable();
        $domain   = $this->cookieDomain !== '' ? $this->cookieDomain : null;

        // ── Mercure authorization cookie ─────────────────────────────────
        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->mercureSecret)
        );

        $mercureToken = $config->builder()
            ->withClaim('mercure', ['subscribe' => ['*']])
            ->expiresAt($now->modify('+1 hour'))
            ->getToken($config->signer(), $config->signingKey());

        $event->getResponse()->headers->setCookie(new Cookie(
            name:     'mercureAuthorization',
            value:    $mercureToken->toString(),
            expire:   $now->modify('+1 hour'),
            path:     '/',
            domain:   $domain,
            secure:   $isSecure,
            httpOnly: true,
            sameSite: Cookie::SAMESITE_LAX,
        ));
    }
}
