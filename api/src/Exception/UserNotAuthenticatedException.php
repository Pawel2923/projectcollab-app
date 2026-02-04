<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class UserNotAuthenticatedException extends HttpException implements Throwable
{
    public function __construct(string $message = "User is not authenticated.", int $code = 401, $headers = [], ?Throwable $previous = null)
    {
        parent::__construct($code, $message, $previous, $headers, $code);
    }
}
