<?php

namespace App\Domains\Pricing\Jobs;

use Lucid\Units\Job;

class GetProductsForPricingJob extends Job
{
    public function __construct(
        private readonly ?string $categoryId = null,
    ) {}
    public function handle(): array { return []; }
}
