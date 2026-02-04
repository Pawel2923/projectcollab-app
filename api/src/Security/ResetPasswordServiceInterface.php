<?php

namespace App\Security;

use App\Entity\User;

interface ResetPasswordServiceInterface
{
    public function sendRequest(User $user): void;
}
