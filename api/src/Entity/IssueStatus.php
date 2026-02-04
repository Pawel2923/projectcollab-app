<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\IssueStatusRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;

#[ORM\Entity(repositoryClass: IssueStatusRepository::class)]
#[ApiResource]
#[ApiFilter(SearchFilter::class, properties: ['project' => 'exact'])]
class IssueStatus
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['issue:read:item', 'issue:update'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['issue:read:item', 'issue:update'])]
    private ?string $value = null;

    #[ORM\ManyToOne(targetEntity: Project::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): static
    {
        $this->value = $value;

        return $this;
    }
}
