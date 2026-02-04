<?php

namespace App\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\Auth\UserOAuthProviders;
use App\Entity\User;
use App\Entity\UserOAuth;
use App\Exception\UserNotAuthenticatedException;
use App\Repository\UserOAuthRepository;
use DateTime;
use DateTimeInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class UserOAuthProvider implements ProviderInterface
{
    public function __construct(
        private Security            $security,
        private LoggerInterface     $logger,
        private UserOAuthRepository $userOAuthRepository,
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): UserOAuthProviders|array|null
    {
        $user = $this->security->getUser();

        if (!($user instanceof User)) {
            $this->logger->warning("GetCurrentUser: User not authenticated");
            throw new UserNotAuthenticatedException();
        }

        $userOAuthProviders = new UserOAuthProviders();

        $userOAuths = $this->userOAuthRepository->findBy(['user' => $user]);
        if (empty($userOAuths)) {
            // Return empty providers
            return $userOAuthProviders;
        }

        // Providers can be empty, this behaviour is expected and should be handled by client
        $providers = $this->getProvidersFromUserOAuth($userOAuths);
        $userOAuthProviders->setProviders($providers);

        $latestSync = null;
        foreach ($userOAuths as $oAuth) {
            if ($oAuth->getLastSyncedAt() && (!$latestSync || $oAuth->getLastSyncedAt() > $latestSync)) {
                $latestSync = $oAuth->getLastSyncedAt();
            }
        }

        if ($latestSync) {
            $userOAuthProviders->setLastSyncedAt($latestSync->format(DateTimeInterface::ATOM));
        }

        return $userOAuthProviders;
    }

    /**
     * Return userOAuth provider names or empty array
     * @param UserOAuth[] $userOAuths
     * @return array
     */
    private function getProvidersFromUserOAuth(array $userOAuths): array
    {
        $providers = [];

        foreach ($userOAuths as $oAuth) {
            if (!$oAuth instanceof UserOAuth || !$oAuth->getProvider()) {
                continue;
            }

            $providers[] = $oAuth->getProvider();
        }

        return $providers;
    }
}
