<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class GetOrderByIdJob extends Job
{
    public function __construct(private readonly string $orderId) {}
    public function handle(): mixed { return null; }
}
