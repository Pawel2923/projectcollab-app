<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251209072035 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add unique index to organization_member table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ORG_MEMBER ON organization_member (organization_id, member_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_ORG_MEMBER');
    }
}
