<?php

namespace App\Domains\Shipment\Jobs;

use Lucid\Units\Job;

class FetchTrackingEventsJob extends Job
{
    public function __construct(
        private readonly string $trackingNumber,
        private readonly string $carrier,
    ) {}
    public function handle(): array { return []; }
}
