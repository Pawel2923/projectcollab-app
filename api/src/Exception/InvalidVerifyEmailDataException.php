<?php

namespace App\Exception;

use Exception;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Throwable;

class InvalidVerifyEmailDataException extends BadRequestHttpException implements Throwable
{
    public function __construct(?string $message = null, ?Exception $previous = null)
    {
        parent::__construct($message ?? 'Invalid data provided for email verification.', $previous, 400);
    }
}
