<?php

namespace App\Tests\Controller;

use App\Controller\LogoutController;
use App\Entity\RefreshToken;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class LogoutControllerTest extends TestCase
{
    public function testRevokesRefreshTokenFromCookieAndClearsAuthCookies(): void
    {
        $refreshTokenEntity = new RefreshToken();

        $repository = $this->createMock(EntityRepository::class);
        $repository
            ->expects(self::once())
            ->method('findOneBy')
            ->with(['refreshToken' => 'cookie-refresh-token'])
            ->willReturn($refreshTokenEntity);

        $em = $this->createMock(EntityManagerInterface::class);
        $em
            ->expects(self::once())
            ->method('getRepository')
            ->with(RefreshToken::class)
            ->willReturn($repository);
        $em->expects(self::once())->method('remove')->with($refreshTokenEntity);
        $em->expects(self::once())->method('flush');

        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects(self::never())->method('error');

        $request = Request::create(
            '/core-api/auth/logout',
            'POST',
            [],
            ['refresh_token' => 'cookie-refresh-token'],
            [],
            ['HTTPS' => 'on']
        );

        $controller = new LogoutController($logger, 'localhost');
        $response   = $controller($request, $em);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());

        $cookies = $response->headers->getCookies();
        $byKey   = [];
        foreach ($cookies as $cookie) {
            $byKey[$cookie->getName() . '@' . $cookie->getPath()] = $cookie;
        }

        self::assertArrayHasKey('token@/', $byKey);
        self::assertArrayHasKey('mercureAuthorization@/', $byKey);
        self::assertArrayHasKey('refresh_token@/core-api/auth', $byKey);
        self::assertArrayHasKey('refresh_token@/core-api/auth/refresh', $byKey);

        foreach ($byKey as $cookie) {
            self::assertSame('', $cookie->getValue());
            self::assertSame(1, $cookie->getExpiresTime());
            self::assertSame('localhost', $cookie->getDomain());
            self::assertTrue($cookie->isSecure());
            self::assertTrue($cookie->isHttpOnly());
            self::assertSame(Cookie::SAMESITE_LAX, $cookie->getSameSite());
        }
    }

    public function testRevokesRefreshTokenFromBodyFallbackWhenCookieMissing(): void
    {
        $refreshTokenEntity = new RefreshToken();

        $repository = $this->createMock(EntityRepository::class);
        $repository
            ->expects(self::once())
            ->method('findOneBy')
            ->with(['refreshToken' => 'body-refresh-token'])
            ->willReturn($refreshTokenEntity);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->method('getRepository')->willReturn($repository);
        $em->expects(self::once())->method('remove')->with($refreshTokenEntity);
        $em->expects(self::once())->method('flush');

        $logger = $this->createMock(LoggerInterface::class);

        $request = Request::create(
            '/core-api/auth/logout',
            'POST',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refresh_token' => 'body-refresh-token'], JSON_THROW_ON_ERROR)
        );

        $controller = new LogoutController($logger);
        $response   = $controller($request, $em);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testClearsCookiesEvenWhenDatabaseRevocationFails(): void
    {
        $em = $this->createMock(EntityManagerInterface::class);
        $em
            ->expects(self::once())
            ->method('getRepository')
            ->willThrowException(new \RuntimeException('DB unavailable'));

        $logger = $this->createMock(LoggerInterface::class);
        $logger
            ->expects(self::once())
            ->method('error')
            ->with('Error during logout: DB unavailable');

        $request = Request::create(
            '/core-api/auth/logout',
            'POST',
            [],
            ['refresh_token' => 'cookie-refresh-token']
        );

        $controller = new LogoutController($logger);
        $response   = $controller($request, $em);

        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        self::assertCount(4, $response->headers->getCookies());
    }
}
