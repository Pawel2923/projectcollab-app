<?php

namespace App\State\Auth\ResetPassword;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\Auth\ResetPassword\ResetPasswordEmailRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\ResetPasswordServiceInterface;
use Psr\Log\LoggerInterface;

final readonly class ResetPasswordEmailProcessor implements ProcessorInterface
{
    public function __construct(
        private UserRepository                $userRepository,
        private ResetPasswordServiceInterface $resetPasswordService,
        private LoggerInterface               $logger,
    )
    {
    }

    /**
     * @param ResetPasswordEmailRequest $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ResetPasswordEmailRequest
    {
        $user = $this->userRepository->findOneBy(['email' => $data->getEmail()]);
        if ($user instanceof User) {
            $this->logger->info('Processing password reset request for user: ' . $user->getEmail());
            $this->resetPasswordService->sendRequest($user);
        }

        // Always return a generic response to avoid user enumeration
        $data->setCode('RESET_PASSWORD_EMAIL_SENT');
        return $data;
    }
}
