<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductPricingJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly ?string $customerId = null,
    ) {}
    public function handle(): array { return []; }
}
