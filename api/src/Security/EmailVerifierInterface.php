<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;

interface EmailVerifierInterface
{
    public function send(User $user): void;

    public function handleConfirmation(Request $request, User $user): void;
}
