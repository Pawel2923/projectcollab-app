<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Entity\OrganizationRole;
use App\Entity\ProjectRole;
use App\Entity\ChatRole;

#[AsCommand(
    name: 'app:seed-roles',
    description: 'Seeds default roles into the database',
)]
class SeedRolesCommand extends Command
{
    private const array ORGANIZATION_ROLES = [
        'CREATOR',
        'ADMIN',
        'MEMBER',
    ];

    private const array PROJECT_ROLES = [
        'CREATOR',
        'ADMIN',
        'PRODUCT_OWNER',
        'SCRUM_MASTER',
        'DEVELOPER',
        'MEMBER',
        'EDITOR',
        'VIEWER',
    ];

    private const array CHAT_ROLES = [
        'CREATOR',
        'ADMIN',
        'MEMBER',
        'MODERATOR',
    ];

    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'If set, the command will not persist changes to the database');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = $input->getOption('dry-run');

        $io->title('Seeding roles into the database');

        try {
            $this->seedRoles(OrganizationRole::class, self::ORGANIZATION_ROLES, $io, $dryRun);
            $this->seedRoles(ProjectRole::class, self::PROJECT_ROLES, $io, $dryRun);
            $this->seedRoles(ChatRole::class, self::CHAT_ROLES, $io, $dryRun);

            if (!$dryRun) {
                $this->entityManager->flush();
            }

            $io->success($dryRun ? 'Dry-run complete. No changes were persisted' : 'Roles have been seeded successfully');

            return Command::SUCCESS;
        } catch (\Throwable $th) {
            $io->error('An error occurred while seeding roles: ' . $th->getMessage());

            if ($output->isVerbose()) {
                $io->text($th->getTraceAsString());
            }

            return Command::FAILURE;
        }
    }

    private function seedRoles(string $entityClass, array $roles, SymfonyStyle $io, bool $dryRun): void
    {
        foreach ($roles as $roleValue) {
            $existingRole = $this->entityManager->getRepository($entityClass)->findOneBy(['value' => $roleValue]);
            if ($existingRole) {
                $io->writeln("Skipping seed for $entityClass: $roleValue already exists");
                continue;
            }

            $io->writeln($dryRun ? "[DRY-RUN] Would create $entityClass '$roleValue'" : "Created $entityClass '$roleValue'");

            if (!$dryRun) {
                $role = new $entityClass();
                $role->setValue($roleValue);
                $this->entityManager->persist($role);
            }
        }
    }
}
