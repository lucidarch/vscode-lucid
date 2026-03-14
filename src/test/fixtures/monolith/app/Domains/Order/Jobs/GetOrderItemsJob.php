<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class GetOrderItemsJob extends Job
{
    public function __construct(private readonly string $orderId) {}
    public function handle(): array { return []; }
}
