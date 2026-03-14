<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class UpdateOrderStatusJob extends Job
{
    public function __construct(
        private readonly string $orderId,
        private readonly string $status,
    ) {}
    public function handle(): void {}
}
