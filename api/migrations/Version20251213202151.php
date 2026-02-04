<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251213202151 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop project sequence id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP CONSTRAINT fk_2fb3d0ee5034ee55');
        $this->addSql('DROP INDEX uniq_2fb3d0ee5034ee55');
        $this->addSql('ALTER TABLE project DROP project_sequence_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ADD project_sequence_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT fk_2fb3d0ee5034ee55 FOREIGN KEY (project_sequence_id) REFERENCES project_sequence (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_2fb3d0ee5034ee55 ON project (project_sequence_id)');
    }
}
