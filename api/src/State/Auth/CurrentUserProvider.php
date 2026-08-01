<?php

namespace App\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Exception\UserNotAuthenticatedException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class CurrentUserProvider implements ProviderInterface
{
    public function __construct(
        private Security        $security,
        private LoggerInterface $logger,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): User
    {
        $user = $this->security->getUser();

        if (!($user instanceof User)) {
            $this->logger->warning("GetCurrentUser: User not authenticated");
            throw new UserNotAuthenticatedException();
        }

        return $user;
    }
}
