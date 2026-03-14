<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class GetStockLevelsJob extends Job
{
    public function __construct(
        private readonly array $productIds = [],
        private readonly ?string $warehouseId = null,
        private readonly int $lowStockThreshold = 10,
    ) {}
    public function handle(): array { return []; }
}
