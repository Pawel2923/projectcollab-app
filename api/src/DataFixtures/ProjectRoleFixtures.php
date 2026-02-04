<?php

namespace App\DataFixtures;

use App\Entity\ProjectRole;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ProjectRoleFixtures extends Fixture
{
    public const array ROLES = [
        'CREATOR',
        'ADMIN',
        'PRODUCT_OWNER',
        'SCRUM_MASTER',
        'DEVELOPER',
        'MEMBER',
        'EDITOR',
        'VIEWER',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::ROLES as $roleValue) {
            $role = new ProjectRole();
            $role->setValue($roleValue);
            $manager->persist($role);
        }

        $manager->flush();
    }
}
