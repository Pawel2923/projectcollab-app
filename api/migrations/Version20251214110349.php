<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251214110349 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add isArchived to issue_sprint table and remove other archive properties';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue_sprint DROP CONSTRAINT fk_1d70df9077be2925');
        $this->addSql('DROP INDEX idx_1d70df9077be2925');
        $this->addSql('ALTER TABLE issue_sprint ADD is_archived BOOLEAN NOT NULL DEFAULT false');
        $this->addSql('ALTER TABLE issue_sprint DROP archived_at');
        $this->addSql('ALTER TABLE issue_sprint DROP archived_by_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue_sprint ADD archived_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE issue_sprint ADD archived_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE issue_sprint DROP is_archived');
        $this->addSql('ALTER TABLE issue_sprint ADD CONSTRAINT fk_1d70df9077be2925 FOREIGN KEY (archived_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_1d70df9077be2925 ON issue_sprint (archived_by_id)');
    }
}
