<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class InitializeProductInventoryJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly int $initialStock = 0,
    ) {}

    public function handle(): void {}
}
