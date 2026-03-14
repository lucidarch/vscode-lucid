<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class ReserveStockJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly int $quantity,
        private readonly string $reservationKey,
        private readonly ?string $variantId = null,
    ) {}

    public function handle(): void {}
}
