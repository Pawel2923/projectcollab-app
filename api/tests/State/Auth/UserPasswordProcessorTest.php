<?php

namespace App\Tests\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Service\Auth\UserPasswordHasherService;
use App\State\Auth\UserPasswordProcessor;
use PHPUnit\Framework\TestCase;

class UserPasswordProcessorTest extends TestCase
{
    public function testProcessHashesPasswordAndCallsInnerProcessorOnce(): void
    {
        $user = new User();
        $operation = $this->createMock(Operation::class);

        $hasherServiceMock = $this->createMock(UserPasswordHasherService::class);
        $hasherServiceMock->expects($this->once())
            ->method('hashPassword')
            ->with($user);

        $innerProcessorMock = $this->createMock(ProcessorInterface::class);
        $innerProcessorMock->expects($this->once())
            ->method('process')
            ->with($user, $operation, [], [])
            ->willReturn($user);

        $processor = new UserPasswordProcessor($innerProcessorMock, $hasherServiceMock);
        $result = $processor->process($user, $operation);

        $this->assertSame($user, $result);
    }
}
