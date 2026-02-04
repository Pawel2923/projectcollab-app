<?php

namespace App\Security;

use App\Entity\User;
use App\Util\UrlManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

readonly class ResetPasswordService implements ResetPasswordServiceInterface
{
    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private MailerInterface $mailer,
        private UrlManagerInterface $urlManager,
    ) {
    }

    /**
     * @throws ResetPasswordExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function sendRequest(User $user): void
    {
        $resetToken = $this->resetPasswordHelper->generateResetToken($user);

        // Point directly to the frontend form with the token
        $url = $this->urlManager->addSearchParamsToUrl(
            "{$this->urlManager->getFrontendUrl()}/reset-password/form",
            [
                'token' => $resetToken->getToken(),
            ]
        );

        $email = new TemplatedEmail()
            ->from('no-reply@example.com')
            ->to($user->getEmail())
            ->subject('Zresetuj swoje hasło')
            ->context([
                    'resetUrl' => $url,
                ])
            ->htmlTemplate('email/reset_password.html.twig');

        $this->mailer->send($email);
    }
}
