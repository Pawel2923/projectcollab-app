<?php

namespace App\OpenApi\Entries;

use ApiPlatform\OpenApi\OpenApi;

abstract class DocsEntry
{
    public function __construct(protected readonly OpenApi $openApi)
    {
    }

    abstract public function addDocs(): void;
}
