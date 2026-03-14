<?php

namespace App\Domains\Payment\Jobs;

use Lucid\Units\Job;

class ProcessRefundPaymentJob extends Job
{
    public function __construct(
        private readonly ?string $refundId = null,
        private readonly ?string $orderId = null,
    ) {}
    public function handle(): void {}
}
