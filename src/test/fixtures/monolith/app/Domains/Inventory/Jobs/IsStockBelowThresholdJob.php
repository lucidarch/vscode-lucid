<?php

namespace App\Domains\Inventory\Jobs;

use Lucid\Units\Job;

class IsStockBelowThresholdJob extends Job
{
    public function __construct(private readonly string $productId) {}
    public function handle(): bool { return false; }
}
