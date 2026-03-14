<?php

namespace App\Domains\Shipment\Jobs;

use Lucid\Units\Job;

class GenerateShippingLabelJob extends Job
{
    public function __construct(
        private readonly string $orderId,
        private readonly string $carrierId,
        private readonly string $serviceCode,
    ) {}
    public function handle(): mixed { return null; }
}
