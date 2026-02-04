<?php

namespace App\Controller;

use App\Entity\Attachment;
use App\Entity\Issue;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\String\Slugger\SluggerInterface;

#[AsController]
class CreateAttachmentController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SluggerInterface       $slugger
    )
    {
    }

    public function __invoke(Request $request): Attachment
    {
        $uploadedFile = $request->files->get('file');
        $issueIri = $request->request->get('issue');

        if (!$uploadedFile) {
            throw new BadRequestHttpException('"file" is required');
        }

        if (!$issueIri) {
            throw new BadRequestHttpException('"issue" is required');
        }

        $issueId = preg_match('/issues\/(\d+)/', $issueIri, $matches) ? $matches[1] : $issueIri;
        $issue = $this->entityManager->getRepository(Issue::class)->find($issueId);

        if (!$issue) {
            throw new BadRequestHttpException('Issue not found');
        }

        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $uploadedFile->guessExtension();

        try {
            $uploadedFile->move(
                $this->getParameter('kernel.project_dir') . '/public/media',
                $newFilename
            );
        } catch (Exception $e) {
            throw new BadRequestHttpException('Failed to upload file: ' . $e->getMessage());
        }

        $attachment = new Attachment();
        $attachment->setPath("/media/$newFilename");
        $attachment->setType($uploadedFile->getClientMimeType() ?? 'application/octet-stream');
        $attachment->setIssue($issue);

        return $attachment;
    }
}
