<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251022132926 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Alter Project OneToOne reference.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ADD project_sequence_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE5034EE55 FOREIGN KEY (project_sequence_id) REFERENCES project_sequence (id) NOT DEFERRABLE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2FB3D0EE5034EE55 ON project (project_sequence_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP CONSTRAINT FK_2FB3D0EE5034EE55');
        $this->addSql('DROP INDEX UNIQ_2FB3D0EE5034EE55');
        $this->addSql('ALTER TABLE project DROP project_sequence_id');
    }
}
