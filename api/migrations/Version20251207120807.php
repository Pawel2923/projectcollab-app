<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251207120807 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove permissions array from project_role';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project_role DROP permissions');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project_role ADD permissions JSON DEFAULT \'[]\' NOT NULL');
    }
}
