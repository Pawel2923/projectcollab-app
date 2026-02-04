<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251117094947 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add username to User.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE comment ALTER commenter_id SET NOT NULL');
        $this->addSql('ALTER TABLE "user" ADD username VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE comment ALTER commenter_id DROP NOT NULL');
        $this->addSql('ALTER TABLE "user" DROP username');
    }
}
