<?php

namespace App\State\Auth\VerifyEmail;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\Auth\VerifyEmail\VerifyEmailResponse;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\EmailVerifierInterface;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpFoundation\RequestStack;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

final readonly class VerifyEmailProvider implements ProviderInterface
{
    public function __construct(
        private RequestStack           $requestStack,
        private UserRepository         $userRepository,
        private LoggerInterface        $logger,
        private EmailVerifierInterface $emailVerifier,
        private EntityManagerInterface $entityManager
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            throw new RuntimeException('No current request available');
        }

        $id = $request->query->get('id');
        $user = $this->userRepository->find($id);
        if (!$id || (!$user instanceof User)) {
            $this->logger->error('User not found', ['id' => $id]);

            return new VerifyEmailResponse('USER_NOT_FOUND', false);
        }

        $this->logger->info('Processing email verification request');
        $this->logger->info('User ID: ' . $user->getId());
        $this->logger->info('User Email: ' . $user->getEmail());
        $this->logger->info('Request Query Parameters: ' . json_encode($request->query->all()));

        $requiredParams = ['id', 'expires', 'token', 'signature'];
        foreach ($requiredParams as $param) {
            $value = $request->query->get($param);
            $this->logger->info("Parameter $param: " . ($value ? 'present (' . strlen($value) . ' chars)' : 'missing'));
        }

        try {
            $this->emailVerifier->handleConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $e) {
            $this->logger->warning('Email verification link invalid or expired', [
                'user_id' => $user->getId(),
                'reason' => $e->getReason(),
            ]);

            return new VerifyEmailResponse('EMAIL_NOT_VERIFIED', false);
        }

        $this->entityManager->flush();

        $this->logger->info('Email verification successful');
        return new VerifyEmailResponse('EMAIL_VERIFIED', true);
    }
}
