<?php

namespace App\State\Auth\VerifyEmail;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\Auth\VerifyEmail\VerificationEmailRequest;
use App\Repository\UserRepository;
use App\Security\EmailVerifierInterface;
use Psr\Log\LoggerInterface;

final readonly class VerificationEmailProcessor implements ProcessorInterface
{
    public function __construct(
        private UserRepository         $userRepository,
        private EmailVerifierInterface $emailVerifier,
        private LoggerInterface        $logger,
    )
    {
    }

    /** @param VerificationEmailRequest $data */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): VerificationEmailRequest
    {
        $user = $this->userRepository->findOneBy(['email' => $data->getEmail()]);

        if ($user || !($user->isVerified())) {
            $this->logger->info('Processing email verification request for user: ' . $user->getEmail());
            $this->emailVerifier->send($user);
        }

        // Always return a generic response to avoid user enumeration
        $data->setCode('VERIFY_EMAIL_SENT');
        return $data;
    }
}
