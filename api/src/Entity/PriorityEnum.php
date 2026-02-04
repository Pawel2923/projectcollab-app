<?php

namespace App\Entity;

enum PriorityEnum: int
{
    case LOW = 1;
    case MEDIUM = 2;
    case HIGH = 3;
    case CRITICAL = 4;

    public function getLabel(): string
    {
        return match ($this) {
            self::LOW => 'Niski',
            self::MEDIUM => 'Średni',
            self::HIGH => 'Wysoki',
            self::CRITICAL => 'Krytyczny',
        };
    }

    public function getValue(): string
    {
        return match ($this) {
            self::LOW => 'low',
            self::MEDIUM => 'medium',
            self::HIGH => 'high',
            self::CRITICAL => 'critical',
        };
    }

    public static function fromValue(string $value): ?self
    {
        return match (strtolower($value)) {
            'low' => self::LOW,
            'medium' => self::MEDIUM,
            'high' => self::HIGH,
            'critical' => self::CRITICAL,
            default => null,
        };
    }
}
