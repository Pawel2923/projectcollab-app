<?php

namespace App\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use App\Service\Auth\UserPasswordHasherService;

readonly class UserCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface        $processor,
        private UserPasswordHasherService $userPasswordHasherService,
    ) {
    }

    /** @var User|object $data */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if (!($data instanceof User)) {
            throw new IncorrectProcessorDataException();
        }

        if (empty(trim((string) $data->getUsername()))) {
            $data->setUsername($this->createUsernameFromEmail($data->getEmail()));
        }

        // Process user password
        $this->userPasswordHasherService->hashPassword($data);

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    private function createUsernameFromEmail(string $email): string
    {
        return explode('@', $email)[0];
    }
}
