<?php

namespace App\Tests\State\Auth;

use ApiPlatform\Metadata\Get;
use App\Entity\User;
use App\Exception\UserNotAuthenticatedException;
use App\State\Auth\CurrentUserProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class CurrentUserProviderTest extends TestCase
{
    public function testProvideReturnsUserWhenAuthenticated(): void
    {
        $user = new User();
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn($user);
        $loggerMock = $this->createMock(LoggerInterface::class);

        $provider = new CurrentUserProvider($securityMock, $loggerMock);
        $result = $provider->provide(new Get());

        $this->assertSame($user, $result);
    }

    public function testProvideThrowsExceptionWhenNotAuthenticated(): void
    {
        $securityMock = $this->createMock(Security::class);
        $securityMock->method('getUser')->willReturn(null);
        $loggerMock = $this->createMock(LoggerInterface::class);
        $loggerMock->expects($this->once())->method('warning');

        $provider = new CurrentUserProvider($securityMock, $loggerMock);

        $this->expectException(UserNotAuthenticatedException::class);
        $provider->provide(new Get());
    }
}
