<?php

namespace App\Controller;

use App\Entity\User;
use App\Exception\UserNotAuthenticatedException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class GetCurrentUser extends AbstractController
{
    public function __construct(
        private readonly Security        $security,
        private readonly LoggerInterface $logger
    )
    {
    }

    public function __invoke(): User
    {
        $user = $this->security->getUser();

        if (!($user instanceof User)) {
            $this->logger->warning("GetCurrentUser: User not authenticated");
            throw new UserNotAuthenticatedException();
        }

        return $user;
    }
}
