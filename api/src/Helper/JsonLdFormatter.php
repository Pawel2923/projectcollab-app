<?php

namespace App\Helper;

use ApiPlatform\Validator\Exception\ValidationException;

class JsonLdFormatter implements FormatterInterface
{
    public function formatValidationException(ValidationException $exception): array
    {
        $violations = [];
        $primaryCode = null;
        $lines = [];

        foreach ($exception->getConstraintViolationList() as $violation) {
            $propertyPath = $violation->getPropertyPath();
            $message = $violation->getMessage();
            $code = $violation->getCode();

            $violations[] = [
                'propertyPath' => $propertyPath,
                'message' => $message,
                'code' => $code,
            ];

            if ($primaryCode === null && !empty($code)) {
                $primaryCode = $code;
            }

            $lines[] = ($propertyPath !== '' ? $propertyPath . ': ' : '') . $message;
        }

        $description = implode("\n", $lines);
        if ($description === '') {
            $description = 'Validation failed.';
        }
        $idPath = '/validation_errors/' . ($primaryCode ?? 'unknown');

        return [
            '@context' => '/contexts/ConstraintViolation',
            '@id' => $idPath,
            '@type' => 'ConstraintViolation',
            'status' => 422,
            'violations' => $violations,
            'detail' => $description,
            'description' => $description,
            'type' => $idPath,
            'title' => 'An error occurred'
        ];
    }
}
