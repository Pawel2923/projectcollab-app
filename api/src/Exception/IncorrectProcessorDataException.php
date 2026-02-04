<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Throwable;

class IncorrectProcessorDataException extends BadRequestHttpException implements Throwable
{
    public function __construct(
        string     $message = 'Data is not instance of processor\'s resource.',
        ?Throwable $previous = null,
        int        $code = 400,
        array      $headers = []
    )
    {
        parent::__construct($message, $previous, $code, $headers);
    }
}
