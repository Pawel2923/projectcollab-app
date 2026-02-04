<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251205223622 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add project_id to issue_status, issue_type, resolution and project_role';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue_status ADD project_id INT NOT NULL');
        $this->addSql('ALTER TABLE issue_status ADD CONSTRAINT FK_89F0EF3B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_89F0EF3B166D1F9C ON issue_status (project_id)');
        $this->addSql('ALTER TABLE issue_type ADD project_id INT NOT NULL');
        $this->addSql('ALTER TABLE issue_type ADD CONSTRAINT FK_D4399FE5166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_D4399FE5166D1F9C ON issue_type (project_id)');
        $this->addSql('ALTER TABLE project_role ADD permissions JSON DEFAULT \'[]\' NOT NULL');
        $this->addSql('ALTER TABLE resolution ADD project_id INT NOT NULL');
        $this->addSql('ALTER TABLE resolution ADD CONSTRAINT FK_FDD30F8A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_FDD30F8A166D1F9C ON resolution (project_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE issue_status DROP CONSTRAINT FK_89F0EF3B166D1F9C');
        $this->addSql('DROP INDEX IDX_89F0EF3B166D1F9C');
        $this->addSql('ALTER TABLE issue_status DROP project_id');
        $this->addSql('ALTER TABLE issue_type DROP CONSTRAINT FK_D4399FE5166D1F9C');
        $this->addSql('DROP INDEX IDX_D4399FE5166D1F9C');
        $this->addSql('ALTER TABLE issue_type DROP project_id');
        $this->addSql('ALTER TABLE project_role DROP permissions');
        $this->addSql('ALTER TABLE resolution DROP CONSTRAINT FK_FDD30F8A166D1F9C');
        $this->addSql('DROP INDEX IDX_FDD30F8A166D1F9C');
        $this->addSql('ALTER TABLE resolution DROP project_id');
    }
}
