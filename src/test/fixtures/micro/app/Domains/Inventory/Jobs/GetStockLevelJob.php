<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class GetStockLevelJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly ?string $variantId = null,
    ) {}

    public function handle(): int
    {
        return 0;
    }
}
