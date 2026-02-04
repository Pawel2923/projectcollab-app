<?php

namespace App\Listener;

use App\Entity\Attachment;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PostRemoveEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsDoctrineListener(event: Events::postRemove, priority: 500, connection: 'default')]
readonly class AttachmentRemoveListener
{
    public function __construct(
        #[Autowire('%kernel.project_dir%')]
        private string $projectDir
    )
    {
    }

    public function postRemove(PostRemoveEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Attachment) {
            return;
        }

        $filePath = "$this->projectDir/public{$entity->getPath()}";

        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
}
