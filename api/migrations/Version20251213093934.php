<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251213093934 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add isArchived to issue and organization';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue ADD is_archived BOOLEAN NOT NULL default false');
        $this->addSql('ALTER TABLE organization ADD is_archived BOOLEAN NOT NULL default false');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue DROP is_archived');
        $this->addSql('ALTER TABLE organization DROP is_archived');
    }
}
