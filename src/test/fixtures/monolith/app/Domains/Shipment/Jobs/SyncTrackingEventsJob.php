<?php

namespace App\Domains\Shipment\Jobs;

use Lucid\Units\Job;

class SyncTrackingEventsJob extends Job
{
    public function __construct(
        private readonly string $shipmentId,
        private readonly array $events,
    ) {}
    public function handle(): void {}
}
