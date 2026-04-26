<?php

namespace App\Security;

use App\Entity\User;
use App\Util\UrlManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mime\Address;

readonly class ResetPasswordService implements ResetPasswordServiceInterface
{
    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private MailerInterface $mailer,
        private UrlManagerInterface $urlManager,
        #[Autowire(env: 'SERVER_NAME')] private string $serverName,
        private LoggerInterface $logger
    ) {
    }

    /**
     * @throws ResetPasswordExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function sendRequest(User $user): void
    {
        $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        $fromAddress = "no-reply@{$this->serverName}";

        $this->logger->info('From address for reset password request', [
            'fromAddress' => $fromAddress,
        ]);

        // Point directly to the frontend form with the token
        $url = $this->urlManager->addSearchParamsToUrl(
            "{$this->urlManager->getFrontendUrl()}/reset-password/form",
            [
                'token' => $resetToken->getToken(),
            ]
        );

        $email = new TemplatedEmail()
            ->from(new Address($fromAddress, 'ProjectCollab'))
            ->to($user->getEmail())
            ->subject('Zresetuj swoje hasło')
            ->context([
                    'resetUrl' => $url,
                ])
            ->htmlTemplate('email/reset_password.html.twig');

        $this->mailer->send($email);
    }
}
