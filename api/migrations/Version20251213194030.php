<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251213194030 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add isArchived flag to chat';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE chat ADD is_archived BOOLEAN NOT NULL DEFAULT false');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE chat DROP is_archived');
    }
}
