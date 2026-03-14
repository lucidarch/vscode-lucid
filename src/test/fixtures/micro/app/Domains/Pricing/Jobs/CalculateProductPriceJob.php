<?php

namespace App\Domains\Pricing\Jobs;

use Lucid\Units\Job;

class CalculateProductPriceJob extends Job
{
    public function __construct(
        private readonly mixed $product,
        private readonly ?string $priceListId = null,
    ) {}
    public function handle(): int { return 0; }
}
