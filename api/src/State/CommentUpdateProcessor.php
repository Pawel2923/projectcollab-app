<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Comment;
use App\Exception\IncorrectProcessorDataException;
use DateTime;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

readonly class CommentUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private LoggerInterface     $logger,
        private PersistProcessor    $persistProcessor,
        private HubInterface        $hub,
        private SerializerInterface $serializer
    )
    {
    }

    /** @throws ExceptionInterface
     * @var Comment|object $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Comment
    {
        if (!$data instanceof Comment) {
            $this->logger->error('CommentCreateProcessor: data is not instance of Comment', [
                'data_instanceof' => $data,
            ]);
            throw new IncorrectProcessorDataException();
        }

        $data->setUpdatedAt(new DateTime());

        /** @var Comment $result */
        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        $this->publishMercureUpdate($result);

        return $result;
    }

    /**
     * @throws ExceptionInterface
     */
    private function publishMercureUpdate(Comment $comment): void
    {
        if ($comment->getIssue()) {
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
}
