<?php

namespace App\Security;

use App\Entity\User;
use App\Util\UrlManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Throwable;

readonly class EmailVerifier implements EmailVerifierInterface
{
    public function __construct(
        private VerifyEmailHelperInterface $helper,
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private UrlManagerInterface $urlManager
    ) {
    }

    /**
     * @throws TransportExceptionInterface
     */
    public function send(User $user): void
    {
        // Generate the signature using the SymfonyCasts helper with the API route
        $signatureComponents = $this->helper->generateSignature(
            '_api_/verify-email_get', // Use the actual API resource route
            (string) $user->getId(),
            $user->getEmail(),
            [
                'id' => $user->getId(),
            ]
        );

        // Extract query parameters from the generated URL
        $backendUrl = $signatureComponents->getSignedUrl();
        $parsedUrl = parse_url($backendUrl);
        $queryString = $parsedUrl['query'] ?? '';

        // Create frontend verification URL that will call the API
        $frontendVerifyUrl = $this->urlManager->getFrontendUrl() . '/verify-email/verify?' . $queryString;

        $this->logger->info('Generated verification URL: ' . $frontendVerifyUrl);

        $email = new TemplatedEmail()
            ->from('no-reply@example.com')
            ->to($user->getEmail())
            ->subject('Zweryfikuj swój adres e-mail')
            ->context([
                    'verificationUrl' => $frontendVerifyUrl,
                ])
            ->htmlTemplate('email/verify_email.html.twig');

        $this->mailer->send($email);
    }

    /**
     * @throws Throwable
     */
    public function handleConfirmation(Request $request, User $user): void
    {
        $this->logger->info('Starting email confirmation validation');
        $this->logger->info('Request URL: ' . $request->getUri());
        $this->logger->info('Query params: ' . json_encode($request->query->all()));

        try {
            $this->helper->validateEmailConfirmationFromRequest($request, (string) $user->getId(), $user->getEmail());
            $user->setIsVerified(true);
            $this->logger->info('Email confirmation validation successful');
        } catch (Throwable $e) {
            $this->logger->error('Email confirmation validation failed: ' . $e->getMessage());
            $this->logger->error('Exception class: ' . get_class($e));
            throw $e;
        }
    }
}
