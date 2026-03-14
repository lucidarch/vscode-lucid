<?php

namespace App\Domains\Shipment\Jobs;

use Lucid\Units\Job;

class GetShipmentByTrackingNumberJob extends Job
{
    public function __construct(private readonly string $trackingNumber) {}
    public function handle(): mixed { return null; }
}
