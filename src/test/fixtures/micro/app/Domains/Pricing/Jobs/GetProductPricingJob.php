<?php

namespace App\Domains\Pricing\Jobs;

use Lucid\Units\Job;

class GetProductPricingJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly ?string $customerId = null,
        private readonly ?string $couponCode = null,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
