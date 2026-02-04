<?php

namespace App\State\Comment;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Comment;
use App\Entity\Issue;
use App\Entity\User;
use App\Exception\IncorrectProcessorDataException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class CommentCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface        $logger,
        private Security               $security,
        private HubInterface           $hub,
        private SerializerInterface    $serializer
    )
    {
    }

    /** @param Comment|object $data
     * @throws ExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        if (!$data instanceof Comment) {
            $this->logger->error('CommentCreateProcessor: data is not instance of Comment', [
                'data_instanceof' => $data,
            ]);
            throw new IncorrectProcessorDataException();
        }

        if (!($data->getIssue() instanceof Issue)) {
            $this->logger->error('CommentCreateProcessor: issue is not instance of Issue', [
                'issue' => $data->getIssue(),
            ]);
            throw new IncorrectProcessorDataException();
        }

        /** @var User|null $user */
        $user = $this->security->getUser();
        if (!($user instanceof User)) {
            $this->logger->error('CommentCreateProcessor: user is not logged in');
            throw new IncorrectProcessorDataException();
        }

        $data->setCommenter($user);

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        $this->publishMercureUpdate($data);
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Comment $comment): void
    {
        $issueId = $comment->getIssue()->getId();
        $topic = '/comments?issueId=' . $issueId;

        $json = $this->serializer->serialize($comment, 'jsonld', ['groups' => ['comment:read']]);

        $update = new Update(
            $topic,
            $json,
            true
        );

        $this->hub->publish($update);
    }
}
