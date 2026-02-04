<?php

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\OpenApi;
use App\OpenApi\Entries\LoginCheck;
use App\OpenApi\Entries\Logout;
use App\OpenApi\Entries\OAuthAuthentication;
use App\OpenApi\Entries\ReportGeneration;
use App\OpenApi\Entries\Search;

readonly class DocsFactory implements OpenApiFactoryInterface
{
    public function __construct(
        private OpenApiFactoryInterface $decorated
    )
    {
    }

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = ($this->decorated)($context);

        new LoginCheck($openApi)->addDocs();
        new OAuthAuthentication($openApi)->addDocs();
        new Logout($openApi)->addDocs();
        new ReportGeneration($openApi)->addDocs();
        new Search($openApi)->addDocs();

        return $openApi;
    }
}
