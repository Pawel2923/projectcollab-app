<?php

namespace App\DataFixtures;

use App\Entity\Comment;
use App\Entity\Issue;
use App\Entity\IssueSprint;
use App\Entity\IssueStatus;
use App\Entity\IssueType;
use App\Entity\Organization;
use App\Entity\OrganizationMember;
use App\Entity\OrganizationRole;
use App\Entity\PriorityEnum;
use App\Entity\Project;
use App\Entity\ProjectMember;
use App\Entity\ProjectRole;
use App\Entity\ProjectSequence;
use App\Entity\Resolution;
use App\Entity\Chat;
use App\Entity\ChatMember;
use App\Entity\ChatRole;
use App\Entity\Message;
use App\Entity\Sprint;
use App\Entity\SprintStatusEnum;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Faker\Generator;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture implements DependentFixtureInterface
{
    private Generator $faker;

    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        $this->faker = Factory::create('pl_PL');
    }

    public function getDependencies(): array
    {
        return [
            OrganizationRoleFixtures::class,
            ProjectRoleFixtures::class,
            ChatRoleFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        // Fetch Roles
        $orgRoles = $this->fetchOrganizationRoles($manager);
        $projectRoles = $this->fetchProjectRoles($manager);
        $chatRoles = $this->fetchChatRoles($manager);

        // 1. Users
        $users = $this->createUsers($manager);

        // 2. Organizations & Members
        $organizations = $this->createOrganizations($manager, $users, $orgRoles);

        // 2.5. Create General Chats for Organizations
        $this->createOrganizationGeneralChats($manager, $organizations, $users, $chatRoles);

        foreach ($organizations as $org) {
            // 3. Projects
            $projects = $this->createProjects($manager, $org);

            foreach ($projects as $project) {
                // 4. Project Members
                $this->createProjectMembers($manager, $project, $users, $projectRoles);

                // 5. Project Metadata (Statuses, Types, etc.)
                $metadata = $this->createProjectMetadata($manager, $project);

                // 6. Sprints
                $sprints = $this->createSprints($manager, $project, $users);

                // 7. Issues
                $this->createIssues($manager, $project, $users, $sprints, $metadata);

                // 8. Chats
                $this->createChats($manager, $project, $users, $chatRoles);
            }
        }

        $manager->flush();
    }

    private function fetchOrganizationRoles(ObjectManager $manager): array
    {
        $roles = [];
        foreach (OrganizationRoleFixtures::ROLES as $roleName) {
            $roles[$roleName] = $manager->getRepository(OrganizationRole::class)->findOneBy(['value' => $roleName]);
        }
        return $roles;
    }

    private function fetchProjectRoles(ObjectManager $manager): array
    {
        $roles = [];
        foreach (ProjectRoleFixtures::ROLES as $roleName) {
            $roles[$roleName] = $manager->getRepository(ProjectRole::class)->findOneBy(['value' => $roleName]);
        }
        return $roles;
    }

    private function fetchChatRoles(ObjectManager $manager): array
    {
        $roles = [];
        foreach (ChatRoleFixtures::ROLES as $roleName) {
            $roles[$roleName] = $manager->getRepository(ChatRole::class)->findOneBy(['value' => $roleName]);
        }
        return $roles;
    }

    private function createUsers(ObjectManager $manager): array
    {
        $users = [];
        $userConfigs = [
            ['admin@example.com', 'Admin Systemu', true],
            ['jan.kowalski@example.com', 'Jan Kowalski', false],
            ['anna.nowak@example.com', 'Anna Nowak', false],
            ['piotr.wisniewski@example.com', 'Piotr Wiśniewski', false],
            ['katarzyna.wojcik@example.com', 'Katarzyna Wójcik', false],
            ['michal.kaminski@example.com', 'Michał Kamiński', false],
            ['agnieszka.lewandowska@example.com', 'Agnieszka Lewandowska', false],
            ['tomasz.zielinski@example.com', 'Tomasz Zieliński', false],
            ['magdalena.szymanska@example.com', 'Magdalena Szymańska', false],
            ['marcin.wozniak@example.com', 'Marcin Woźniak', false]
        ];

        foreach ($userConfigs as [$email, $username, $isGlobalAdmin]) {
            $user = new User();
            $user->setEmail($email);
            $user->setUsername($username);
            $user->setPlainPassword('password');
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
            $user->setIsVerified(true);
            if ($isGlobalAdmin) {
                $user->setRoles(['ROLE_ADMIN']);
            }
            $manager->persist($user);
            $users[] = $user;
        }

        return $users;
    }

    private function createOrganizations(ObjectManager $manager, array $users, array $orgRoles): array
    {
        $organizations = [];
        $orgNames = ['Software House "Kodujemy"', 'StartUp "Innowacje"'];

        foreach ($orgNames as $index => $name) {
            $org = new Organization();
            $org->setName($name);
            $manager->persist($org);
            $organizations[] = $org;

            foreach ($users as $uIndex => $user) {
                $member = new OrganizationMember();
                $member->setOrganization($org);
                $member->setMember($user);
                $member->setIsBlocked(false);

                if ($uIndex === 0) {
                    $member->setRole($orgRoles['CREATOR']);
                } elseif ($uIndex < 3) {
                    $member->setRole($orgRoles['ADMIN']);
                } else {
                    $member->setRole($orgRoles['MEMBER']);
                }
                $manager->persist($member);
            }
        }
        return $organizations;
    }

    private function createOrganizationGeneralChats(ObjectManager $manager, array $organizations, array $users, array $chatRoles): void
    {
        foreach ($organizations as $org) {
            $chat = new Chat();
            $chat->setName('Ogólny');
            $chat->setType(Chat::TYPE_GENERAL);
            $chat->setOrganization($org);
            $manager->persist($chat);

            // Add all organization members to the general chat
            foreach ($users as $index => $user) {
                $chatMember = new ChatMember();
                $chatMember->setChat($chat);
                $chatMember->setMember($user);

                if ($index === 0) {
                    $chatMember->setRole($chatRoles['CREATOR']);
                } else {
                    $chatMember->setRole($chatRoles['MEMBER']);
                }

                $manager->persist($chatMember);
                $chat->addChatMember($chatMember);
            }

            // Add some messages to the general chat
            for ($k = 0; $k < $this->faker->numberBetween(3, 10); $k++) {
                $message = new Message();
                $message->setChat($chat);
                $chatMembers = $chat->getChatMembers()->toArray();
                $sender = $this->faker->randomElement($chatMembers);
                $message->setSender($sender);
                $message->setContent($this->faker->sentence());
                $message->setCreatedAt(DateTimeImmutable::createFromMutable($this->faker->dateTimeBetween('now', '+1 month')));
                $manager->persist($message);
            }
        }
    }

    private function createProjects(ObjectManager $manager, Organization $org): array
    {
        $projects = [];
        $projectNames = [
            ['System CRM', 'CRM'],
            ['Aplikacja Mobilna', 'MOB'],
            ['Strona Korporacyjna', 'WEB']
        ];

        foreach ($projectNames as [$name, $abbr]) {
            $project = new Project();
            $project->setName($name);
            $project->setNameAbbreviation($abbr);
            $project->setOrganization($org);

            $sequence = new ProjectSequence();
            $sequence->setProjectId($project);
            $sequence->setLastIssueNumber(0);
            $manager->persist($sequence);
            $project->setProjectSequence($sequence);

            $manager->persist($project);
            $projects[] = $project;
        }

        return $projects;
    }

    private function createProjectMembers(ObjectManager $manager, Project $project, array $users, array $roles): void
    {
        foreach ($users as $index => $user) {
            // Not every user in every project
            if ($index > 7) continue;

            $member = new ProjectMember();
            $member->setProject($project);
            $member->setMember($user);

            if ($index === 0) {
                $member->setRole($roles['PRODUCT_OWNER']);
            } elseif ($index < 3) {
                $member->setRole($roles['SCRUM_MASTER']);
            } else {
                 $member->setRole($roles['MEMBER']);
            }
            $manager->persist($member);
            $project->addProjectMember($member);
        }
    }

    private function createProjectMetadata(ObjectManager $manager, Project $project): array
    {
        $data = [
            'statuses' => [],
            'types' => [],
            'resolutions' => []
        ];

        // Statuses
        $statuses = [
            'Do zrobienia' => 'to_do',
            'W toku' => 'in_progress',
            'Code Review' => 'review',
            'Testy' => 'qa',
            'Gotowe' => 'done'
        ];

        foreach ($statuses as $val => $key) {
             $s = new IssueStatus();
             $s->setValue($val);
             $s->setProject($project);
             $manager->persist($s);
             $data['statuses'][] = $s;
        }

        // Types
        $types = ['Błąd', 'Zadanie', 'Historyjka', 'Ulepszenie'];
        foreach ($types as $val) {
            $t = new IssueType();
            $t->setValue($val);
            $t->setProject($project);
            $manager->persist($t);
            $data['types'][] = $t;
        }

        // Resolutions
        $resolutions = ['Rozwiązane', 'Nie do naprawienia', 'Duplikat', 'Odrzucone'];
        foreach ($resolutions as $val) {
            $r = new Resolution();
            $r->setValue($val);
            $r->setProject($project);
            $manager->persist($r);
            $data['resolutions'][] = $r;
        }

        return $data;
    }

    private function createSprints(ObjectManager $manager, Project $project, array $users): array
    {
        $sprints = [];
        // Past
        for ($i = 1; $i <= 3; $i++) {
            $sprint = new Sprint();
            $sprint->setName("Sprint $i");
            $sprint->setProject($project);
            $sprint->setStatus(SprintStatusEnum::COMPLETED);
            $sprint->setStartDate(new \DateTime("+".(($i-1)*2)." weeks"));
            $sprint->setEndDate(new \DateTime("+".(($i-1)*2 + 2)." weeks"));
            $sprint->setGoal("Cel sprintu $i: Implementacja funkcjonalności.");
            $sprint->setCreatedBy($users[0]);
            $manager->persist($sprint);
            $sprints[] = $sprint;
        }

        // Current
        $currentSprint = new Sprint();
        $currentSprint->setName("Sprint 4");
        $currentSprint->setProject($project);
        $currentSprint->setStatus(SprintStatusEnum::STARTED);
        $currentSprint->setStartDate(new \DateTime("+6 weeks"));
        $currentSprint->setEndDate(new \DateTime("+8 weeks"));
        $currentSprint->setGoal("Cel sprintu 4: Stabilizacja.");
        $currentSprint->setCreatedBy($users[0]);
        $manager->persist($currentSprint);
        $sprints[] = $currentSprint;

        // Future
        $futureSprint = new Sprint();
        $futureSprint->setName("Sprint 5");
        $futureSprint->setProject($project);
        $futureSprint->setStatus(SprintStatusEnum::CREATED);
        $futureSprint->setStartDate(new \DateTime("+8 weeks"));
        $futureSprint->setEndDate(new \DateTime("+10 weeks"));
        $futureSprint->setGoal("Cel sprintu 5: Rozwój.");
        $futureSprint->setCreatedBy($users[0]);
        $manager->persist($futureSprint);
        $sprints[] = $futureSprint;

        return $sprints;
    }

    private function createIssues(ObjectManager $manager, Project $project, array $users, array $sprints, array $metadata): void
    {
        $statuses = $metadata['statuses'];
        $types = $metadata['types'];
        $resolutions = $metadata['resolutions'];

        for ($i = 1; $i <= 20; $i++) {
            $issue = new Issue();
            $issue->setProject($project);

            $projectSequence = $project->getProjectSequence();
            $nextNumber = $projectSequence->getLastIssueNumber() + 1;
            $projectSequence->setLastIssueNumber($nextNumber);
            $issue->setKey($project->getNameAbbreviation() . '-' . $nextNumber);

            $issue->setTitle($this->faker->realText(50));
            $issue->setDescription($this->faker->realText(200));

            $issue->setEstimated($this->faker->numberBetween(60, 480)); // minutes
            $issue->setLoggedTime($this->faker->numberBetween(0, 300));

            $issue->setCreatedAtForFixtures(DateTimeImmutable::createFromMutable($this->faker->dateTimeBetween('now', '+2 months')));
            $issue->setUpdatedAt(new \DateTime('+2 months'));

            // Set start and end dates
            $startDate = $this->faker->dateTimeBetween('now', '+2 months');
            $issue->setStartDate($startDate);
            $endDate = (clone $startDate)->modify('+' . $this->faker->numberBetween(3, 21) . ' days');
            $issue->setEndDate($endDate);

            $issue->setPriority($this->faker->randomElement([PriorityEnum::LOW, PriorityEnum::MEDIUM, PriorityEnum::HIGH, PriorityEnum::CRITICAL]));

            // Random Status
            /** @var IssueStatus $status */
            $status = $this->faker->randomElement($statuses);
            $issue->setStatus($status);

            // Random Type
            /** @var IssueType $type */
            $type = $this->faker->randomElement($types);
            $issue->setType($type);

            // Reporter & Assignee
            $issue->setReporter($this->faker->randomElement($users));
            $issue->addAssignee($this->faker->randomElement($users));

            // If status is Done, set resolution
            if ($status->getValue() === 'Gotowe') {
                $issue->setResolution($this->faker->randomElement($resolutions));
            }

            $manager->persist($issue);

            // Assign to sprint (randomly)
            if ($this->faker->boolean(70) && !empty($sprints)) {
                $sprint = $this->faker->randomElement($sprints);
                $issueSprint = new IssueSprint();
                $issueSprint->setIssue($issue);
                $issueSprint->setSprint($sprint);
                $manager->persist($issueSprint);
            }

            // Comments
            if ($this->faker->boolean(50)) {
                for ($k = 0; $k < $this->faker->numberBetween(1, 4); $k++) {
                    $comment = new Comment();
                    $comment->setContent($this->faker->sentence());
                    $comment->setCommenter($this->faker->randomElement($users));
                    $comment->setCreatedAtForFixtures(DateTimeImmutable::createFromMutable($this->faker->dateTimeBetween('now', '+1 month')));
                    $comment->setIssue($issue);
                    $manager->persist($comment);
                }
            }
        }
    }

    private function createChats(ObjectManager $manager, Project $project, array $users, array $chatRoles): void
    {
        $chatNames = ['General', 'Random', 'Development'];

        foreach ($chatNames as $name) {
            $chat = new Chat();
            $chat->setName($project->getName() . ' - ' . $name);
            $chat->setType(Chat::TYPE_GROUP);
            $chat->setProject($project);
            $chat->setOrganization($project->getOrganization());
            $manager->persist($chat);

            $members = [];
            foreach ($users as $index => $user) {
                // Add first 5 users to chat
                if ($index > 4) continue;

                $chatMember = new ChatMember();
                $chatMember->setChat($chat);
                $chatMember->setMember($user);

                if ($index === 0) {
                    $chatMember->setRole($chatRoles['CREATOR']);
                } else {
                    $chatMember->setRole($chatRoles['MEMBER']);
                }

                $manager->persist($chatMember);
                $chat->addChatMember($chatMember);
                $members[] = $chatMember;
            }

            // Messages
            for ($k = 0; $k < $this->faker->numberBetween(5, 15); $k++) {
                $message = new Message();
                $message->setChat($chat);
                $sender = $this->faker->randomElement($members);
                $message->setSender($sender);
                $message->setContent($this->faker->sentence());
                $message->setCreatedAt(DateTimeImmutable::createFromMutable($this->faker->dateTimeBetween('now', '+1 month')));
                $manager->persist($message);
            }
        }
    }
}
