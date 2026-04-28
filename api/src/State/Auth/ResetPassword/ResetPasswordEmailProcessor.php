<?php

namespace App\State\Auth\ResetPassword;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\Auth\ResetPassword\ResetPasswordEmailRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\ResetPasswordService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;

final readonly class ResetPasswordEmailProcessor implements ProcessorInterface
{
    public function __construct(
        private UserRepository       $userRepository,
        private ResetPasswordService $resetPasswordService,
        private LoggerInterface      $logger,
    )
    {
    }

    /**
     * @param ResetPasswordEmailRequest $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return ResetPasswordEmailRequest
     * @throws ResetPasswordExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ResetPasswordEmailRequest
    {
        $user = $this->userRepository->findOneBy(['email' => $data->getEmail()]);
        if ($user instanceof User) {
            $this->logger->info('[ResetPasswordEmailProcessor]: Processing reset email request', ['email' => $data->getEmail()]);
            $this->resetPasswordService->sendRequest($user);
        }

        $data->setCode('RESET_PASSWORD_EMAIL_SENT');
        return $data;
    }
}
