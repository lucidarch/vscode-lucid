<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class UpdateStockLevelJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly string $warehouseId,
        private readonly int $delta,
    ) {}
    public function handle(): void {}
}
