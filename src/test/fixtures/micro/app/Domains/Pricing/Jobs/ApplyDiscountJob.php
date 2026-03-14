<?php

namespace App\Domains\Pricing\Jobs;

use Lucid\Units\Job;

class ApplyDiscountJob extends Job
{
    public function __construct(
        private readonly string $couponCode,
        private readonly int $subtotal,
        private readonly ?string $customerId = null,
    ) {}

    public function handle(): int
    {
        return 0;
    }
}
