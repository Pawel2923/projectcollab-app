<?php

namespace App\Tests\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Service\Auth\UserPasswordHasherService;
use App\State\Auth\UserCreateProcessor;
use PHPUnit\Framework\TestCase;

class UserCreateProcessorTest extends TestCase
{
    public function testProcessHashesPasswordAndPersistsOnce(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setPlainPassword('secret123');

        $operation = $this->createMock(Operation::class);

        $hasherServiceMock = $this->createMock(UserPasswordHasherService::class);
        $hasherServiceMock->expects($this->once())
            ->method('hashPassword')
            ->with($user);

        $processorMock = $this->createMock(ProcessorInterface::class);
        $processorMock->expects($this->once())
            ->method('process')
            ->with($user, $operation, [], [])
            ->willReturn($user);

        $processor = new UserCreateProcessor($processorMock, $hasherServiceMock);
        $result = $processor->process($user, $operation);

        $this->assertSame($user, $result);
        $this->assertEquals('test', $user->getUsername());
    }

    public function testProcessThrowsExceptionOnInvalidData(): void
    {
        $operation = $this->createMock(Operation::class);
        $hasherServiceMock = $this->createMock(UserPasswordHasherService::class);
        $processorMock = $this->createMock(ProcessorInterface::class);

        $processor = new UserCreateProcessor($processorMock, $hasherServiceMock);

        $this->expectException(IncorrectProcessorDataException::class);
        $processor->process(new \stdClass(), $operation);
    }
}
