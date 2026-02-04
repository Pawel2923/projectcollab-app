<?php

namespace App\State\Auth\ResetPassword;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\Auth\ResetPassword\ResetPasswordInput;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

final readonly class ResetPasswordProcessor implements ProcessorInterface
{
    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private UserPasswordHasherInterface  $passwordHasher,
        private EntityManagerInterface       $entityManager,
        private LoggerInterface              $logger
    )
    {
    }

    /** @param ResetPasswordInput $data
     * @throws ResetPasswordExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        /** @var User $user */
        $user = $this->resetPasswordHelper->validateTokenAndFetchUser($data->getToken());
        $user->setPassword($this->passwordHasher->hashPassword($user, $data->getPlainPassword()));
        $user->setPlainPassword(null);

        $this->resetPasswordHelper->removeResetRequest($data->getToken());
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->logger->info('Password reset successful for user: ' . $user->getEmail());
        // Clear sensitive data
        $data->setToken(null);
        $data->setPlainPassword(null);
    }
}
