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
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Throwable;

readonly class EmailVerifier implements EmailVerifierInterface
{
    public function __construct(
        private VerifyEmailHelperInterface             $helper,
        private MailerInterface                        $mailer,
        private LoggerInterface                        $logger,
        private UrlManagerInterface                    $urlManager,
        #[Autowire(env: 'SERVER_NAME')] private string $serverName
    )
    {
    }

    /**
     * @throws TransportExceptionInterface
     */
    public function send(User $user): void
    {
        $signatureComponents = $this->helper->generateSignature(
            '_api_/verify-email_get',
            (string)$user->getId(),
            $user->getEmail(),
            [
                'id' => $user->getId(),
            ]
        );

        $backendUrl = $signatureComponents->getSignedUrl();
        $parsedUrl = parse_url($backendUrl);
        $queryString = $parsedUrl['query'] ?? '';

        $frontendVerifyUrl = "{$this->urlManager->getFrontendUrl()}/verify-email/verify?$queryString";
        $this->logger->info("Generated verification URL: $frontendVerifyUrl");

        $email = new TemplatedEmail()
            ->from("no-reply@$this->serverName")
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
        $this->logger->info('Starting email confirmation validation', [
            'request_uri' => $request->getUri(),
            'query_params' => $request->query->all(),
            'user_id' => $user->getId(),
            'user_email' => $user->getEmail(),
        ]);

        try {
            $this->helper->validateEmailConfirmationFromRequest($request, (string)$user->getId(), $user->getEmail());
            $user->setIsVerified(true);
            $this->logger->info('Email confirmation validation successful');
        } catch (Throwable $e) {
            $this->logger->error('Email confirmation validation failed', [
                'exception_class' => get_class($e),
                'exception' => $e,
            ]);

            throw $e;
        }
    }
}
