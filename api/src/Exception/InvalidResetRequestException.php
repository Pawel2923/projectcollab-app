<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Throwable;

class InvalidResetRequestException extends BadRequestHttpException implements Throwable
{
    public function __construct(string $message = 'Reset token or password is invalid.', ?Throwable $previous = null, int $code = 400, array $headers = [])
    {
        parent::__construct($message, $previous, $code, $headers);
    }
}
