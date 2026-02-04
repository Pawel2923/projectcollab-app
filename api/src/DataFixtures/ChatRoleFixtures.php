<?php

namespace App\DataFixtures;

use App\Entity\ChatRole;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ChatRoleFixtures extends Fixture
{
    public const array ROLES = [
        'CREATOR',
        'ADMIN',
        'MEMBER',
        'MODERATOR',
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::ROLES as $roleValue) {
            $role = new ChatRole();
            $role->setValue($roleValue);
            $manager->persist($role);
        }

        $manager->flush();
    }
}
