<?php

namespace App\State\Auth\ResetPassword;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\Auth\ResetPassword\ResetPasswordValidation;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpFoundation\RequestStack;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

final readonly class ResetPasswordValidationProvider implements ProviderInterface
{
    public function __construct(
        private RequestStack                 $requestStack,
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private LoggerInterface              $logger,
    )
    {
    }

    /**
     * @throws ResetPasswordExceptionInterface
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            throw new RuntimeException('No current request available');
        }

        // Accept both 'token' and 'reset_token' parameters for compatibility
        $token = $request->query->get('token') ?: $request->query->get('reset_token') ?: '';
        if (empty($token)) {
            $this->logger->error('No reset token provided');
            return new ResetPasswordValidation('NO_TOKEN_PROVIDED', false);
        }

        $this->logger->info('Processing password reset token validation');
        $this->logger->info('Token length: ' . strlen($token));

        // Validate the token
        $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);

        $this->logger->info('Password reset token validation successful for user: ' . $user->getEmail());
        return new ResetPasswordValidation('TOKEN_VALID', true, $token);
    }
}
