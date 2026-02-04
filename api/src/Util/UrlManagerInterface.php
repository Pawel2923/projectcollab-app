<?php

namespace App\Util;

interface UrlManagerInterface
{
    public function addSearchParamsToUrl(string $url, array $params): string;

    public function getBackendUrl(): string;

    public function getFrontendUrl(): string;
}
