<?php

namespace App\Tests\State\Auth;

use ApiPlatform\Metadata\Operation;
use App\DTO\Auth\VerifyEmail\VerifyEmailResponse;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\EmailVerifierInterface;
use App\State\Auth\VerifyEmail\VerifyEmailProvider;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\InputBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class VerifyEmailProviderTest extends TestCase
{
    public function testProvideUserNotFound(): void
    {
        $request = new Request(['id' => '123']);
        $requestStack = $this->createMock(RequestStack::class);
        $requestStack->method('getCurrentRequest')->willReturn($request);

        $userRepository = $this->createMock(UserRepository::class);
        $userRepository->method('find')->with('123')->willReturn(null);

        $logger = $this->createMock(LoggerInterface::class);
        $emailVerifier = $this->createMock(EmailVerifierInterface::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);

        $provider = new VerifyEmailProvider(
            $requestStack,
            $userRepository,
            $logger,
            $emailVerifier,
            $entityManager
        );

        $operation = $this->createMock(Operation::class);
        /** @var VerifyEmailResponse $response */
        $response = $provider->provide($operation);

        $this->assertInstanceOf(VerifyEmailResponse::class, $response);
        $this->assertEquals('USER_NOT_FOUND', $response->getCode());
        $this->assertFalse($response->getIsVerified());
    }

    public function testProvideSuccess(): void
    {
        $request = new Request([
            'id' => '1',
            'expires' => '1700000000',
            'token' => 'sampletoken',
            'signature' => 'samplesignature',
        ]);

        $requestStack = $this->createMock(RequestStack::class);
        $requestStack->method('getCurrentRequest')->willReturn($request);

        $user = new User();
        $reflection = new \ReflectionClass($user);
        $property = $reflection->getProperty('id');
        $property->setValue($user, 1);
        $user->setEmail('user@example.com');

        $userRepository = $this->createMock(UserRepository::class);
        $userRepository->method('find')->with('1')->willReturn($user);

        $logger = $this->createMock(LoggerInterface::class);
        $emailVerifier = $this->createMock(EmailVerifierInterface::class);
        $emailVerifier->expects($this->once())
            ->method('handleConfirmation')
            ->with($request, $user);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush');

        $provider = new VerifyEmailProvider(
            $requestStack,
            $userRepository,
            $logger,
            $emailVerifier,
            $entityManager
        );

        $operation = $this->createMock(Operation::class);
        /** @var VerifyEmailResponse $response */
        $response = $provider->provide($operation);

        $this->assertInstanceOf(VerifyEmailResponse::class, $response);
        $this->assertEquals('EMAIL_VERIFIED', $response->getCode());
        $this->assertTrue($response->getIsVerified());
    }
}
