<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251017142800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change relationship between ProjectSequence and Project to OneToOne.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_6fc85cf0166d1f9c');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6FC85CF0166D1F9C ON project_sequence (project_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_6FC85CF0166D1F9C');
        $this->addSql('CREATE INDEX idx_6fc85cf0166d1f9c ON project_sequence (project_id)');
    }
}
