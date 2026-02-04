<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251006144514 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add not null constraint to project table organization_id column';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ALTER organization_id SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ALTER organization_id DROP NOT NULL');
    }
}
