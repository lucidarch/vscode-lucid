<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class CreateStockAdjustmentJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly string $warehouseId,
        private readonly int $delta,
        private readonly string $reason,
        private readonly ?string $adjustedBy = null,
    ) {}
    public function handle(): mixed { return null; }
}
