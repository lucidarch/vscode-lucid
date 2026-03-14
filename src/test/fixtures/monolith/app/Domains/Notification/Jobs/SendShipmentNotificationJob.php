<?php

namespace App\Domains\Notification\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotificationJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $orderId,
        private readonly ?string $trackingNumber = null,
    ) {}
    public function handle(): void {}
}
