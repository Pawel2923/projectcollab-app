<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251029182504 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change priority column from string to integer representation';
    }

    public function up(Schema $schema): void
    {
        // Convert existing string priority values to integers
        $this->addSql("UPDATE issue SET priority = '1' WHERE priority = 'low'");
        $this->addSql("UPDATE issue SET priority = '2' WHERE priority = 'medium'");
        $this->addSql("UPDATE issue SET priority = '3' WHERE priority = 'high'");
        $this->addSql("UPDATE issue SET priority = '4' WHERE priority = 'critical'");

        // Change column type from VARCHAR to INT
        $this->addSql('ALTER TABLE issue ALTER priority TYPE INT USING priority::integer');
    }

    public function down(Schema $schema): void
    {
        // Change column type back to VARCHAR
        $this->addSql('ALTER TABLE issue ALTER priority TYPE VARCHAR(255)');

        // Convert integers back to string values
        $this->addSql("UPDATE issue SET priority = 'low' WHERE priority = '1'");
        $this->addSql("UPDATE issue SET priority = 'medium' WHERE priority = '2'");
        $this->addSql("UPDATE issue SET priority = 'high' WHERE priority = '3'");
        $this->addSql("UPDATE issue SET priority = 'critical' WHERE priority = '4'");
    }
}
