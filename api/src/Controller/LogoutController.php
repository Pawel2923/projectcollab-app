<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken as GesdinetRefreshToken;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Throwable;
use function is_array;
use function is_string;
use function json_decode;

final class LogoutController extends AbstractController
{
    public function __construct(
        private readonly LoggerInterface $logger
    )
    {
    }

    #[Route(path: '/auth/logout', name: 'auth_logout', methods: ['POST'])]
    public function __invoke(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode((string)$request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['error' => 'INVALID_REQUEST'], Response::HTTP_BAD_REQUEST);
        }

        $refreshToken = $data['refresh_token'] ?? null;
        if (!is_string($refreshToken) || $refreshToken === '') {
            return new JsonResponse(['error' => 'MISSING_REFRESH_TOKEN'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $repo = $em->getRepository(GesdinetRefreshToken::class);
            $entity = $repo->findOneBy(['refreshToken' => $refreshToken]);

            if ($entity !== null) {
                $em->remove($entity);
                $em->flush();
            }
        } catch (Throwable $e) {
            // For security, do not leak details. Return 204 regardless.
            $this->logger->error('Error during logout: ' . $e->getMessage());
        }

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
