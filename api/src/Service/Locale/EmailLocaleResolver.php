<?php

namespace App\Service\Locale;

final readonly class EmailLocaleResolver
{
    public const string BASE_LOCALE = 'pl';

    /**
     * @var list<string>
     */
    public const array SUPPORTED_LOCALES = ['pl', 'en'];

    public function resolve(?string $locale): string
    {
        if ($locale === null) {
            return self::BASE_LOCALE;
        }

        $normalized = strtolower(trim($locale));
        if ($normalized === '') {
            return self::BASE_LOCALE;
        }

        if (in_array($normalized, self::SUPPORTED_LOCALES, true)) {
            return $normalized;
        }

        $baseLanguage = preg_split('/[-_]/', $normalized)[0] ?? '';
        if (in_array($baseLanguage, self::SUPPORTED_LOCALES, true)) {
            return $baseLanguage;
        }

        return self::BASE_LOCALE;
    }
}
