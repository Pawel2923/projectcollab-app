<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProjectSequenceRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProjectSequenceRepository::class)]
#[ApiResource]
class ProjectSequence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'projectSequence')]
    #[ORM\JoinColumn(name: 'project_id', referencedColumnName: 'id')]
    private ?Project $projectId = null;

    #[ORM\Column(nullable: true)]
    private ?int $lastIssueNumber = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProjectId(): ?Project
    {
        return $this->projectId;
    }

    public function setProjectId(?Project $projectId): static
    {
        $this->projectId = $projectId;

        return $this;
    }

    public function getLastIssueNumber(): ?int
    {
        return $this->lastIssueNumber;
    }

    public function setLastIssueNumber(?int $lastIssueNumber): static
    {
        $this->lastIssueNumber = $lastIssueNumber;

        return $this;
    }
}
