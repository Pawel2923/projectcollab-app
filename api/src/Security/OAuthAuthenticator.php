<?php

namespace App\Security;

use App\DTO\Auth\OAuthUserdata;
use App\Entity\User;
use App\Entity\UserOAuth;
use App\Repository\UserOAuthRepository;
use App\Repository\UserRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use TheNetworg\OAuth2\Client\Provider\Azure;
use TheNetworg\OAuth2\Client\Token\AccessToken;
use Throwable;

class OAuthAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly ProviderService                $provider,
        private readonly EntityManagerInterface         $entityManager,
        private readonly UserRepository                 $userRepository,
        private readonly UserOAuthRepository            $userOAuthRepository,
        private readonly JWTTokenManagerInterface       $jwtManager,
        private readonly UserPasswordHasherInterface    $passwordHasher,
        private readonly RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private readonly RefreshTokenManagerInterface   $refreshTokenManager,
        private readonly LoggerInterface                $logger,
        private readonly EventDispatcherInterface       $eventDispatcher
    )
    {
    }

    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'auth_oauth_check'
            && $request->isMethod('POST');
    }

    public function authenticate(Request $request): Passport
    {
        try {
            $provider = $request->attributes->get('provider');
            $payload = $request->getPayload();
            $accessToken = $payload->get('access_token');
            $refreshToken = $payload->get('refresh_token');
            $idToken = $payload->get('id_token');
            $expiresAt = $payload->get('expires_at');

            if (!$accessToken) {
                throw new CustomUserMessageAuthenticationException('No access token provided');
            }

            $client = $this->provider->getProviderClient($provider);
            $accessTokenOptions = ['access_token' => $accessToken];
            if ($idToken) {
                $accessTokenOptions['id_token'] = $idToken;

                // Extract tenant ID from id_token to ensure correct key discovery (Azure only)
                $oauthProvider = $client->getOAuth2Provider();
                if ($oauthProvider instanceof Azure) {
                    $parts = explode('.', $idToken);
                    if (count($parts) === 3) {
                        $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0])), true);
                        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

                        error_log('Debug: ID Token Header: ' . print_r($header, true));
                        error_log('Debug: ID Token Payload TID: ' . ($payload['tid'] ?? 'not set'));
                        error_log('Debug: Current Provider Tenant: ' . $oauthProvider->tenant);

                        if (isset($payload['tid'])) {
                            $oauthProvider->tenant = $payload['tid'];
                            error_log('Debug: Switched Provider Tenant to: ' . $oauthProvider->tenant);
                        }
                    } else {
                        error_log('Debug: Invalid ID Token format (not 3 parts)');
                    }
                }
            }

            $oauthProvider = $client->getOAuth2Provider();
            if ($oauthProvider instanceof Azure) {
                $resourceOwner = $client->fetchUserFromToken(new AccessToken($accessTokenOptions, $oauthProvider));
            } else {
                $resourceOwner = $client->fetchUserFromToken(new \League\OAuth2\Client\Token\AccessToken($accessTokenOptions));
            }
            error_log('Debug: Resource Owner Data: ' . print_r($resourceOwner->toArray(), true));
            $providerUser = new OAuthUserdata()->fromResourceOwner($resourceOwner);

            return new SelfValidatingPassport(
                $this->getUserBadge($providerUser, $accessToken, $refreshToken, $expiresAt, $provider)
            );
        } catch (Throwable $th) {
            error_log('OAuth Authentication Error: ' . $th->getMessage());
            error_log('Trace: ' . $th->getTraceAsString());
            throw new CustomUserMessageAuthenticationException('Invalid access token: ' . $th->getMessage());
        }
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $user = $token->getUser();
        $jwt = $this->jwtManager->create($user);

        $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl($user, 2592000); // 1 month
        $refreshToken->setUsername($user->getUserIdentifier());
        $this->refreshTokenManager->save($refreshToken);

        $response = new JsonResponse([
            'token' => $jwt,
            'refresh_token' => $refreshToken->getRefreshToken(),
        ]);

        $event = new AuthenticationSuccessEvent(['token' => $jwt], $user, $response);
        $this->eventDispatcher->dispatch($event, Events::AUTHENTICATION_SUCCESS);

        return $response;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData())
        ], Response::HTTP_UNAUTHORIZED);
    }

    private function getUserBadge(OAuthUserdata $providerUser, string $accessToken, ?string $refreshToken, ?int $expiresAt, string $provider): UserBadge
    {
        $providerId = $providerUser->getId();
        $email = $providerUser->getEmail();

        if (!$email) {
            throw new CustomUserMessageAuthenticationException('Provider did not return an email address');
        }

        $this->logger->debug("OAuthAuthenticator: ", [
            'providerId' => $providerId,
            'email' => $email,
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken,
            'expiresAt' => $expiresAt,
            'provider' => $provider,
        ]);

        return new UserBadge($email, function () use ($email, $provider, $providerId, $accessToken, $refreshToken, $expiresAt) {
            $userOAuth = $this->userOAuthRepository->findOneBy([
                'provider' => $provider,
                'providerId' => $providerId,
            ]);

            $expiresDateTime = $expiresAt ? new DateTime()->setTimestamp($expiresAt) : null;

            if ($userOAuth) {
                $userOAuth->setAccessToken($accessToken);
                if ($refreshToken) {
                    $userOAuth->setRefreshToken($refreshToken);
                }
                if ($expiresDateTime) {
                    $userOAuth->setExpiresAt($expiresDateTime);
                }
                $this->entityManager->flush();

                return $userOAuth->getUser();
            }

            $user = $this->userRepository->findOneBy(['email' => $email]);

            if (!$user) {
                $user = new User();
                $user->setEmail($email);
                $user->setPassword($this->passwordHasher->hashPassword($user, bin2hex(random_bytes(16))));
                $this->entityManager->persist($user);
            }

            $userOAuth = new UserOAuth();
            $userOAuth->setProvider($provider);
            $userOAuth->setProviderId($providerId);
            $userOAuth->setUser($user);
            $userOAuth->setAccessToken($accessToken);
            if ($refreshToken) {
                $userOAuth->setRefreshToken($refreshToken);
            }
            if ($expiresDateTime) {
                $userOAuth->setExpiresAt($expiresDateTime);
            }

            $this->entityManager->persist($userOAuth);
            $this->entityManager->flush();

            return $user;
        });
    }
}
