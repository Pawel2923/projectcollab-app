<?php

namespace App\Tests\Template;

use PHPUnit\Framework\TestCase;
use Symfony\Bridge\Twig\Extension\TranslationExtension;
use Symfony\Component\Translation\Loader\YamlFileLoader;
use Symfony\Component\Translation\Translator;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

class EmailTemplatesTest extends TestCase
{
    private Environment $twig;

    protected function setUp(): void
    {
        $translator = new Translator('pl');
        $translator->setFallbackLocales(['pl']);
        $translator->addLoader('yaml', new YamlFileLoader());
        $translator->addResource('yaml', __DIR__ . '/../../translations/emails.pl.yaml', 'pl', 'emails');
        $translator->addResource('yaml', __DIR__ . '/../../translations/emails.en.yaml', 'en', 'emails');

        $loader = new FilesystemLoader(__DIR__ . '/../../templates');
        $this->twig = new Environment($loader, [
            'strict_variables' => true,
            'autoescape' => 'html',
        ]);
        $this->twig->addExtension(new TranslationExtension($translator));
    }

    public function testVerifyEmailTemplateDefaultsToPolishLocale(): void
    {
        $url = 'https://app.projectcollab.example/verify-email/verify?id=42&token=abc&signature=xyz';
        $html = $this->twig->render('email/verify_email.html.twig', [
            'verificationUrl' => $url,
        ]);

        $escapedUrl = htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $this->assertStringContainsString('<html lang="pl">', $html);
        $this->assertStringContainsString('Potwierdź adres e-mail', $html);
        $this->assertStringContainsString('Jeśli nie utworzyłeś konta, nie musisz podejmować żadnych działań.', $html);
        $this->assertStringContainsString('Zespół ProjectCollab', $html);
        $this->assertStringContainsString('href="' . $escapedUrl . '"', $html);
        $this->assertEmailClientCompatibilityAndSpaTheme($html);
    }

    public function testVerifyEmailTemplateRendersEnglishLocale(): void
    {
        $url = 'https://app.projectcollab.example/verify-email/verify?id=42&token=abc&signature=xyz';
        $html = $this->twig->render('email/verify_email.html.twig', [
            'verificationUrl' => $url,
            'locale' => 'en',
        ]);

        $escapedUrl = htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $this->assertStringContainsString('<html lang="en">', $html);
        $this->assertStringContainsString('Verify email address', $html);
        $this->assertStringContainsString('If you did not create an account, no further action is required.', $html);
        $this->assertStringContainsString('The ProjectCollab Team', $html);
        $this->assertStringContainsString('href="' . $escapedUrl . '"', $html);
        $this->assertEmailClientCompatibilityAndSpaTheme($html);
    }

    public function testResetPasswordTemplateDefaultsToPolishLocale(): void
    {
        $url = 'https://app.projectcollab.example/reset-password/form?token=secret-token&ref=mail';
        $html = $this->twig->render('email/reset_password.html.twig', [
            'resetUrl' => $url,
        ]);

        $escapedUrl = htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $this->assertStringContainsString('<html lang="pl">', $html);
        $this->assertStringContainsString('Zresetuj hasło', $html);
        $this->assertStringContainsString('Jeśli nie prosiłeś o zresetowanie hasła, nie musisz podejmować żadnych działań.', $html);
        $this->assertStringContainsString('Zespół ProjectCollab', $html);
        $this->assertStringContainsString('href="' . $escapedUrl . '"', $html);
        $this->assertEmailClientCompatibilityAndSpaTheme($html);
    }

    public function testResetPasswordTemplateRendersEnglishLocale(): void
    {
        $url = 'https://app.projectcollab.example/reset-password/form?token=secret-token&ref=mail';
        $html = $this->twig->render('email/reset_password.html.twig', [
            'resetUrl' => $url,
            'locale' => 'en',
        ]);

        $escapedUrl = htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $this->assertStringContainsString('<html lang="en">', $html);
        $this->assertStringContainsString('Reset password', $html);
        $this->assertStringContainsString('If you did not request a password reset, no further action is required.', $html);
        $this->assertStringContainsString('The ProjectCollab Team', $html);
        $this->assertStringContainsString('href="' . $escapedUrl . '"', $html);
        $this->assertEmailClientCompatibilityAndSpaTheme($html);
    }

    private function assertEmailClientCompatibilityAndSpaTheme(string $html): void
    {
        $this->assertStringContainsString('<meta charset="UTF-8">', $html);
        $this->assertStringContainsString('<meta name="viewport"', $html);
        $this->assertStringContainsString('ProjectCollab', $html);
        $this->assertStringContainsString('#f5f5f5', $html);
        $this->assertStringContainsString('#ffffff', $html);
        $this->assertStringContainsString('#1abc9c', $html);
        $this->assertStringContainsString('#000000', $html);
        $this->assertStringContainsString('#0e7e68', $html);
        $this->assertStringContainsString('#ecf0f1', $html);

        $this->assertStringNotContainsString('<style', $html);
        $this->assertStringNotContainsString('@media', $html);
        $this->assertStringNotContainsString('prefers-color-scheme', $html);
        $this->assertStringNotContainsString('xmlns:v', $html);
        $this->assertStringNotContainsString('xmlns:o', $html);
        $this->assertStringNotContainsString('oklch(', $html);
        $this->assertStringNotContainsString('var(--', $html);
        $this->assertStringNotContainsString('<svg', $html);
        $this->assertStringNotContainsString('display: flex', $html);
        $this->assertStringNotContainsString('display: grid', $html);
    }
}
