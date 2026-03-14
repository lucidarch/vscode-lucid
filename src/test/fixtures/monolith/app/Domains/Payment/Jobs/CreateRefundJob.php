<?php

namespace App\Domains\Payment\Jobs;

use Lucid\Units\Job;

class CreateRefundJob extends Job
{
    public function __construct(
        private readonly string $orderId,
        private readonly array $items,
        private readonly string $reason,
        private readonly int $amount,
    ) {}
    public function handle(): mixed { return null; }
}
