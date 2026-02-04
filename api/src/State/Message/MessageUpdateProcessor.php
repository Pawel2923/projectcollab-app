<?php

namespace App\State\Message;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Message;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use DateTimeImmutable;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class MessageUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private Security            $security,
        private PersistProcessor    $processor,
        private HubInterface        $hub,
        private SerializerInterface $serializer
    )
    {
    }

    /**
     * @param Message|object $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return Message
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Message
    {
        if (!$data instanceof Message) {
            throw new IncorrectProcessorDataException('MessageUpdateProcessor can only process Message objects.');
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedHttpException('You must be logged in to update a message.');
        }

        $data->setUpdatedAt(new DateTimeImmutable());

        $result = $this->processor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Message $message): void
    {
        $chatId = $message->getChat()->getId();
        $topic = "/chats/$chatId";

        $json = $this->serializer->serialize($message, 'jsonld', ['groups' => ['message:read']]);

        $update = new Update(
            $topic,
            $json,
            true
        );

        $this->hub->publish($update);
    }
}
