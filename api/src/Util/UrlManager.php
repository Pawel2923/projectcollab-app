<?php

namespace App\Util;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class UrlManager implements UrlManagerInterface
{
    public function __construct(
        #[Autowire(env: 'BACKEND_URL')] private string  $backendUrl,
        #[Autowire(env: 'FRONTEND_URL')] private string $frontendUrl
    )
    {
    }

    public function addSearchParamsToUrl(string $url, array $params): string
    {
        return $url . '?' . http_build_query($params);
    }

    public function getBackendUrl(): string
    {
        return $this->backendUrl;
    }

    public function getFrontendUrl(): string
    {
        return $this->frontendUrl;
    }
}
