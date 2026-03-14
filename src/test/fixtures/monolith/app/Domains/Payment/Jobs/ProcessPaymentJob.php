<?php

namespace App\Domains\Payment\Jobs;

use Lucid\Units\Job;

class ProcessPaymentJob extends Job
{
    public function __construct(
        private readonly string $orderId,
        private readonly string $paymentMethodId,
        private readonly int $amount,
    ) {}
    public function handle(): mixed { return null; }
}
