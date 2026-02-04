<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251203000431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add unique constraint on chat name within organization';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CHAT_NAME_ORG ON chat (name, organization_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_CHAT_NAME_ORG');
    }
}
