<?php

namespace App\Domains\Notification\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderConfirmationJob extends Job implements ShouldQueue
{
    public function __construct(private readonly string $orderId) {}
    public function handle(): void {}
}
