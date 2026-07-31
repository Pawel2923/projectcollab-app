<?php

namespace App\State\Auth;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Service\Auth\UserPasswordHasherService;

final readonly class UserPasswordProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface        $processor,
        private UserPasswordHasherService $userPasswordHasherService
    ) {
    }

    /**
     * @param User $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return User
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if ($data instanceof User) {
            $this->userPasswordHasherService->hashPassword($data);
        }

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }
}
