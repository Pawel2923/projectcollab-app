<?php

namespace App\Subscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\User;
use App\Security\EmailVerifier;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Throwable;

final readonly class UserCreatedSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EmailVerifier   $emailVerifier,
        private LoggerInterface $logger
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['onUserCreated', EventPriorities::POST_WRITE],
        ];
    }

    public function onUserCreated(ViewEvent $event): void
    {
        $user = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if (!$user instanceof User || Request::METHOD_POST !== $method) {
            $this->logger->info('UserCreatedSubscriber::onUserCreated(): The created resource is not a User entity or method is not valid. Skipping email verification.');
            return;
        }

        try {
            $this->logger->info('Sending verification email to new user.');
            $this->emailVerifier->send($user);
            $this->logger->info('Verification email sent successfully.');
        } catch (Throwable $ex) {
            $this->logger->error('There was an error sending the verification email.');
            $this->logger->error($ex->getMessage());
        }
    }
}
