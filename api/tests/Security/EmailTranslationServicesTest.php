<?php

namespace App\Tests\Security;

use App\Entity\User;
use App\Security\EmailVerifier;
use App\Security\ResetPasswordService;
use App\Service\Locale\EmailLocaleResolver;
use App\Util\UrlManagerInterface;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Translation\Loader\YamlFileLoader;
use Symfony\Component\Translation\Translator;
use SymfonyCasts\Bundle\ResetPassword\Model\ResetPasswordToken;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;
use SymfonyCasts\Bundle\VerifyEmail\Model\VerifyEmailSignatureComponents;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;

class EmailTranslationServicesTest extends TestCase
{
    private Translator $translator;
    private EmailLocaleResolver $localeResolver;

    protected function setUp(): void
    {
        $this->translator = new Translator('pl');
        $this->translator->setFallbackLocales(['pl']);
        $this->translator->addLoader('yaml', new YamlFileLoader());
        $this->translator->addResource('yaml', __DIR__ . '/../../translations/emails.pl.yaml', 'pl', 'emails');
        $this->translator->addResource('yaml', __DIR__ . '/../../translations/emails.en.yaml', 'en', 'emails');
        $this->localeResolver = new EmailLocaleResolver();
    }

    public function testEmailVerifierTranslatesSubjectAndPassesResolvedLocale(): void
    {
        $user = $this->createUser(42, 'user@example.com');

        $verifyHelper = $this->createMock(VerifyEmailHelperInterface::class);
        $verifyHelper->method('generateSignature')->willReturn(
            new VerifyEmailSignatureComponents(
                new DateTimeImmutable('+1 hour'),
                'https://api.example.com/core-api/verify-email?id=42&token=abc',
                time()
            )
        );

        $urlManager = $this->createMock(UrlManagerInterface::class);
        $urlManager->method('getFrontendUrl')->willReturn('https://app.example.com');

        $sentEmails = [];
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->method('send')->willReturnCallback(function (TemplatedEmail $email) use (&$sentEmails): void {
            $sentEmails[] = $email;
        });

        $verifier = new EmailVerifier(
            $verifyHelper,
            $mailer,
            $this->createMock(LoggerInterface::class),
            $urlManager,
            $this->translator,
            $this->localeResolver,
            'example.com'
        );

        $verifier->send($user, 'en');
        $verifier->send($user, 'de');
        $verifier->send($user);

        $this->assertCount(3, $sentEmails);

        $this->assertSame('Verify your email address', $sentEmails[0]->getSubject());
        $this->assertSame('en', $sentEmails[0]->getContext()['locale']);

        $this->assertSame('Zweryfikuj swój adres e-mail', $sentEmails[1]->getSubject());
        $this->assertSame('pl', $sentEmails[1]->getContext()['locale']);

        $this->assertSame('Zweryfikuj swój adres e-mail', $sentEmails[2]->getSubject());
        $this->assertSame('pl', $sentEmails[2]->getContext()['locale']);
    }

    public function testResetPasswordServiceTranslatesSubjectAndPassesResolvedLocale(): void
    {
        $user = $this->createUser(7, 'user@example.com');

        $resetHelper = $this->createMock(ResetPasswordHelperInterface::class);
        $resetHelper->method('generateResetToken')->willReturn(
            new ResetPasswordToken('reset-token', new DateTimeImmutable('+1 hour'), time())
        );

        $urlManager = $this->createMock(UrlManagerInterface::class);
        $urlManager->method('getFrontendUrl')->willReturn('https://app.example.com');
        $urlManager->method('addSearchParamsToUrl')->willReturn('https://app.example.com/reset-password/form?token=reset-token');

        $sentEmails = [];
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->method('send')->willReturnCallback(function (TemplatedEmail $email) use (&$sentEmails): void {
            $sentEmails[] = $email;
        });

        $service = new ResetPasswordService(
            $resetHelper,
            $mailer,
            $urlManager,
            $this->translator,
            $this->localeResolver,
            'example.com',
            $this->createMock(LoggerInterface::class)
        );

        $service->sendRequest($user, 'en-US');
        $service->sendRequest($user, null);

        $this->assertCount(2, $sentEmails);

        $this->assertSame('Reset your password', $sentEmails[0]->getSubject());
        $this->assertSame('en', $sentEmails[0]->getContext()['locale']);

        $this->assertSame('Zresetuj swoje hasło', $sentEmails[1]->getSubject());
        $this->assertSame('pl', $sentEmails[1]->getContext()['locale']);
    }

    private function createUser(int $id, string $email): User
    {
        $user = new User();
        $reflection = new \ReflectionClass($user);
        $property = $reflection->getProperty('id');
        $property->setValue($user, $id);
        $user->setEmail($email);

        return $user;
    }
}
