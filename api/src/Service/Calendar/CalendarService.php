<?php

namespace App\Service\Calendar;

use App\Entity\Issue;
use App\Entity\User;
use App\Entity\UserOAuth;
use App\Security\ProviderService;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Throwable;

abstract class CalendarService
{
    public function __construct(
        protected EntityManagerInterface $entityManager,
        protected LoggerInterface        $logger,
        protected ProviderService        $provider,
    )
    {
    }

    /**
     * Sync issues with User's Calendar.
     * @param User $user
     * @param Issue[] $issues
     * @return void
     */
    abstract public function syncIssues(User $user, array $issues): void;

    /**
     * Validate User's OAuth token. If refresh token is available, refresh it.
     * Otherwise, return false.
     * @param UserOAuth $userOAuth
     * @param string $provider
     * @return bool
     */
    protected function validateTokens(UserOAuth $userOAuth, string $provider): bool
    {
        $this->logger->info('CalendarService: validating tokens', ['user_oauth_id' => $userOAuth->getId(), 'provider' => $provider]);
        try {
            $expiresAt = $userOAuth->getExpiresAt();

            // Add a small buffer (e.g. 5 minutes) to refresh before actual expiration
            if ($expiresAt && $expiresAt > new DateTime()->modify('+5 minutes')) {
                return true;
            }

            $refreshToken = $userOAuth->getRefreshToken();
            if (!$refreshToken) {
                $this->logger->warning('OAuth token expired and no refresh token available.', [
                    'user_oauth_id' => $userOAuth->getId(),
                    'user_id' => $userOAuth->getUser()->getId(),
                    'provider' => $userOAuth->getProvider()
                ]);
                return false;
            }
            $this->logger->info('Refreshing OAuth token.', [
                'user_oauth_id' => $userOAuth->getId(),
                'provider' => $userOAuth->getProvider()
            ]);


            $oauthProvider = $this->provider->getProviderClient($provider)->getOAuth2Provider();

            $newToken = $oauthProvider->getAccessToken('refresh_token', [
                'refresh_token' => $refreshToken
            ]);

            $userOAuth->setAccessToken($newToken->getToken());

            // Some providers rotate refresh tokens
            if ($newToken->getRefreshToken()) {
                $userOAuth->setRefreshToken($newToken->getRefreshToken());
            }

            if ($newToken->getExpires()) {
                $userOAuth->setExpiresAt(new DateTime()->setTimestamp($newToken->getExpires()));
            }

            $this->entityManager->persist($userOAuth);
            $this->entityManager->flush();

            return true;

        } catch (Throwable $th) {
            $this->logger->error('Failed to refresh OAuth token.', [
                'exception' => $th->getMessage(),
                'user_oauth_id' => $userOAuth->getId()
            ]);
            return false;
        }
    }
}
