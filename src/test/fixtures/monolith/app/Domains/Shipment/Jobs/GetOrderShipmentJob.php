<?php

namespace App\Domains\Shipment\Jobs;

use Lucid\Units\Job;

class GetOrderShipmentJob extends Job
{
    public function __construct(private readonly string $orderId) {}
    public function handle(): mixed { return null; }
}
