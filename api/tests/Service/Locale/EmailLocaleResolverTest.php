<?php

namespace App\Tests\Service\Locale;

use App\Service\Locale\EmailLocaleResolver;
use PHPUnit\Framework\TestCase;

class EmailLocaleResolverTest extends TestCase
{
    private EmailLocaleResolver $resolver;

    protected function setUp(): void
    {
        $this->resolver = new EmailLocaleResolver();
    }

    public function testResolvesSupportedLocales(): void
    {
        $this->assertSame('pl', $this->resolver->resolve('pl'));
        $this->assertSame('en', $this->resolver->resolve('en'));
        $this->assertSame('en', $this->resolver->resolve(' EN '));
        $this->assertSame('en', $this->resolver->resolve('en-US'));
        $this->assertSame('pl', $this->resolver->resolve('pl_PL'));
    }

    public function testFallsBackToBaseLocaleForMissingOrUnsupportedValues(): void
    {
        $this->assertSame('pl', $this->resolver->resolve(null));
        $this->assertSame('pl', $this->resolver->resolve(''));
        $this->assertSame('pl', $this->resolver->resolve('   '));
        $this->assertSame('pl', $this->resolver->resolve('de'));
        $this->assertSame('pl', $this->resolver->resolve('fr-FR'));
    }
}
