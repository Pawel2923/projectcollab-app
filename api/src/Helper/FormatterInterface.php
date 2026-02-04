<?php

namespace App\Helper;

use ApiPlatform\Validator\Exception\ValidationException;

interface FormatterInterface
{
    public function formatValidationException(ValidationException $exception): array;
}
