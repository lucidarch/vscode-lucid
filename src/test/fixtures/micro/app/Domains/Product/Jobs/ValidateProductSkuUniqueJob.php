<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class ValidateProductSkuUniqueJob extends Job
{
    public function __construct(
        private readonly string $sku,
        private readonly ?string $excludeProductId = null,
    ) {}

    public function handle(): void {}
}
