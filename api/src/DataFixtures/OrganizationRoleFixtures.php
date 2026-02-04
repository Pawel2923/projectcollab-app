<?php

namespace App\DataFixtures;

use App\Entity\OrganizationRole;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class OrganizationRoleFixtures extends Fixture
{
    public const array ROLES = [
        'CREATOR',
        'ADMIN',
        'MEMBER',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::ROLES as $roleValue) {
            $role = new OrganizationRole();
            $role->setValue($roleValue);
            $manager->persist($role);
        }

        $manager->flush();
    }
}
