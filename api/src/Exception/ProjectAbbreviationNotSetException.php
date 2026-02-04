<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Throwable;

class ProjectAbbreviationNotSetException extends BadRequestHttpException implements Throwable
{
    public function __construct(
        string     $message = 'Project is missing name abbreviation',
        ?Throwable $previous = null,
        int        $code = 400,
        array      $headers = []
    )
    {
        parent::__construct($message, $previous, $code, $headers);
    }
}
