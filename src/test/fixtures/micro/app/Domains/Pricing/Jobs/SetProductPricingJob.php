<?php

namespace App\Domains\Pricing\Jobs;

use Lucid\Units\Job;

class SetProductPricingJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly int $basePrice,
        private readonly ?int $compareAtPrice = null,
        private readonly string $currency = 'USD',
    ) {}

    public function handle(): void {}
}
