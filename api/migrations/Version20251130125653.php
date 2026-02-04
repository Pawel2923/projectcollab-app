<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251130125653 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update chat table and message table. Ensure that existing chats have required fields.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE chat ADD type VARCHAR(20) DEFAULT \'general\' NOT NULL');
        $this->addSql('ALTER TABLE chat ALTER type DROP DEFAULT');

        $this->addSql('ALTER TABLE chat ADD organization_id INT DEFAULT NULL');
        $this->addSql('
            UPDATE chat c 
            SET organization_id = (
                SELECT om.organization_id 
                FROM chat_member cm 
                JOIN organization_member om ON cm.member_id = om.member_id 
                WHERE cm.chat_id = c.id 
                LIMIT 1
            )
        ');

        $this->addSql('DELETE FROM chat WHERE organization_id IS NULL');
        $this->addSql('ALTER TABLE chat ALTER organization_id SET NOT NULL');

        $this->addSql('ALTER TABLE chat ADD project_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE chat ADD issue_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE chat ADD sprint_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AA32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) NOT DEFERRABLE');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AA166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AA5E7AA58C FOREIGN KEY (issue_id) REFERENCES issue (id)');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AA8C24077B FOREIGN KEY (sprint_id) REFERENCES sprint (id)');
        $this->addSql('CREATE INDEX IDX_659DF2AA32C8A3DE ON chat (organization_id)');
        $this->addSql('CREATE INDEX IDX_659DF2AA166D1F9C ON chat (project_id)');
        $this->addSql('CREATE INDEX IDX_659DF2AA5E7AA58C ON chat (issue_id)');
        $this->addSql('CREATE INDEX IDX_659DF2AA8C24077B ON chat (sprint_id)');
        $this->addSql('ALTER TABLE message ADD parent_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE message ALTER is_deleted DROP DEFAULT');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F727ACA70 FOREIGN KEY (parent_id) REFERENCES message (id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F727ACA70 ON message (parent_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AA32C8A3DE');
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AA166D1F9C');
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AA5E7AA58C');
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AA8C24077B');
        $this->addSql('DROP INDEX IDX_659DF2AA32C8A3DE');
        $this->addSql('DROP INDEX IDX_659DF2AA166D1F9C');
        $this->addSql('DROP INDEX IDX_659DF2AA5E7AA58C');
        $this->addSql('DROP INDEX IDX_659DF2AA8C24077B');
        $this->addSql('ALTER TABLE chat DROP type');
        $this->addSql('ALTER TABLE chat DROP organization_id');
        $this->addSql('ALTER TABLE chat DROP project_id');
        $this->addSql('ALTER TABLE chat DROP issue_id');
        $this->addSql('ALTER TABLE chat DROP sprint_id');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F727ACA70');
        $this->addSql('DROP INDEX IDX_B6BD307F727ACA70');
        $this->addSql('ALTER TABLE message DROP parent_id');
        $this->addSql('ALTER TABLE message ALTER is_deleted SET DEFAULT false');
    }
}
