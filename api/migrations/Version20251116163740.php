<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251116163740 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix comments isDeleted and add relation to the user.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE comment ADD commenter_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE comment RENAME COLUMN is_deleted TO is_archived');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CB4D5A9E2 FOREIGN KEY (commenter_id) REFERENCES "user" (id)');
        $this->addSql('CREATE INDEX IDX_9474526CB4D5A9E2 ON comment (commenter_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE comment DROP CONSTRAINT FK_9474526CB4D5A9E2');
        $this->addSql('DROP INDEX IDX_9474526CB4D5A9E2');
        $this->addSql('ALTER TABLE comment DROP commenter_id');
        $this->addSql('ALTER TABLE comment RENAME COLUMN is_archived TO is_deleted');
    }
}
