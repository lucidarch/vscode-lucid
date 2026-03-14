<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class CreateOrderJob extends Job
{
    public function __construct(
        private readonly mixed $cart,
        private readonly string $userId,
        private readonly string $shippingAddressId,
        private readonly string $billingAddressId,
        private readonly int $discount = 0,
        private readonly ?string $notes = null,
    ) {}
    public function handle(): mixed { return null; }
}
