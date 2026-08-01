<?php

namespace App\Tests\Service\Auth;

use App\Entity\User;
use App\Service\Auth\UserPasswordHasherService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserPasswordHasherServiceTest extends TestCase
{
    public function testHashPasswordHashesWhenPlainPasswordIsSet(): void
    {
        $user = new User();
        $user->setPlainPassword('secret123');

        $hasherMock = $this->createMock(UserPasswordHasherInterface::class);
        $hasherMock->expects($this->once())
            ->method('hashPassword')
            ->with($user, 'secret123')
            ->willReturn('hashed_secret123');

        $service = new UserPasswordHasherService($hasherMock);
        $result = $service->hashPassword($user);

        $this->assertSame($user, $result);
        $this->assertEquals('hashed_secret123', $user->getPassword());
        $this->assertNull($user->getPlainPassword());
    }

    public function testHashPasswordDoesNothingWhenPlainPasswordIsNull(): void
    {
        $user = new User();
        $user->setPassword('existing_hash');

        $hasherMock = $this->createMock(UserPasswordHasherInterface::class);
        $hasherMock->expects($this->never())
            ->method('hashPassword');

        $service = new UserPasswordHasherService($hasherMock);
        $result = $service->hashPassword($user);

        $this->assertSame($user, $result);
        $this->assertEquals('existing_hash', $user->getPassword());
    }
}
