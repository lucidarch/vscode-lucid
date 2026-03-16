<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class SyncProductToExternalCatalogJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly string $catalogId,
    ) {}

    public function handle(): bool
    {
        // TODO: not yet wired into any Feature
        return false;
    }
}
