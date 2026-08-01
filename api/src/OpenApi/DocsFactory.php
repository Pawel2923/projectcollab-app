<?php

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\OpenApi;
use App\OpenApi\Entries\LoginCheck;
use App\OpenApi\Entries\Logout;
use App\OpenApi\Entries\OAuthAuthentication;

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

        return $openApi;
    }
}
