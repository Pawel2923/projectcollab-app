<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260228121954 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update default value of is_archived column in sprint table to false';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sprint ALTER is_archived SET DEFAULT false');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sprint ALTER is_archived DROP DEFAULT');
    }
}
