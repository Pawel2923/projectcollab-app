<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251125083956 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add is_archived to tag table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE tag ADD is_archived BOOLEAN DEFAULT false NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE tag DROP is_archived');
    }
}
