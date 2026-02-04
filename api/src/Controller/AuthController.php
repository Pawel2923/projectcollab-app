<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    #[Route('/auth/oauth/{provider}', name: 'auth_oauth_check', methods: ['POST'])]
    public function check(): JsonResponse
    {
        // This controller should not be reached if the authenticator handles the request.
        // However, we return a response just in case, or for documentation.
        return new JsonResponse(['message' => 'Authentication failed or not handled'], 401);
    }
}
