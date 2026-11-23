<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken as GesdinetRefreshToken;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Throwable;

#[Route('/core-api')]
final class LogoutController extends AbstractController
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly string $cookieDomain = '',
    ) {
    }

    #[Route(path: '/auth/logout', name: 'auth_logout', methods: ['POST'])]
    public function __invoke(Request $request, EntityManagerInterface $em): Response
    {
        // ── Resolve refresh token ────────────────────────────────────────
        // Cookie-first: SPA/browser clients send the refresh_token cookie automatically.
        // Even though the cookie was issued with Path=/core-api/auth/refresh, the server
        // can read any cookie on the domain regardless of path restrictions.
        $refreshToken = $request->cookies->get('refresh_token');

        // Body fallback for /frontend server actions and CLI tools (deprecated).
        // @deprecated Will be removed once /frontend is fully migrated to /spa.
        if (!is_string($refreshToken) || $refreshToken === '') {
            $data         = json_decode((string) $request->getContent(), true);
            $refreshToken = is_array($data) ? ($data['refresh_token'] ?? null) : null;
        }

        // ── Revoke refresh token in database ─────────────────────────────
        if (is_string($refreshToken) && $refreshToken !== '') {
            try {
                $entityClass = class_exists(\App\Entity\RefreshToken::class)
                    ? \App\Entity\RefreshToken::class
                    : GesdinetRefreshToken::class;
                $repo   = $em->getRepository($entityClass);
                $entity = $repo->findOneBy(['refreshToken' => $refreshToken]);

                if ($entity !== null) {
                    $em->remove($entity);
                    $em->flush();
                }
            } catch (Throwable $e) {
                // For security, do not leak details. Proceed with cookie clearing regardless.
                $this->logger->error('Error during logout: ' . $e->getMessage());
            }
        }

        $response = new Response(null, Response::HTTP_NO_CONTENT);
        $isSecure = $request->isSecure();
        $domain   = $this->cookieDomain !== '' ? $this->cookieDomain : null;

        // ── Clear access-token cookie ─────────────────────────────────────
        $response->headers->setCookie(
            Cookie::create('token', '', 1, '/', $domain, $isSecure, true, false, Cookie::SAMESITE_LAX)
        );

        // ── Clear refresh-token cookie ────────────────────────────────────
        // Must use the same path/domain as when the cookie was set.
        $response->headers->setCookie(
            Cookie::create('refresh_token', '', 1, '/core-api/auth/refresh', $domain, $isSecure, true, false, Cookie::SAMESITE_LAX)
        );

        return $response;
    }
}
