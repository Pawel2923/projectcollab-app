<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251207123556 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add expires_at column to user_oauth table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_oauth ADD expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_oauth DROP expires_at');
    }
}
