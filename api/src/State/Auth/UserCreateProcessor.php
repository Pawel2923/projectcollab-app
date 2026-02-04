<?php

namespace App\State\Auth;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;

readonly class UserCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor      $processor,
        private UserPasswordProcessor $userPasswordProcessor,
    )
    {
    }

    /** @var User|object $data */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if (!($data instanceof User)) {
            throw new IncorrectProcessorDataException();
        }

        if (empty(trim($data->getUsername()))) {
            $data->setUsername($this->createUsernameFromEmail($data->getEmail()));
        }

        // Process user password
        $data = $this->userPasswordProcessor->process($data, $operation, $uriVariables, $context);

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    private function createUsernameFromEmail(string $email): string
    {
        return explode('@', $email)[0];
    }
}
