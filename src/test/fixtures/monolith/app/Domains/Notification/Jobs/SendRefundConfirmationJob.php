<?php

namespace App\Domains\Notification\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendRefundConfirmationJob extends Job implements ShouldQueue
{
    public function __construct(private readonly string $refundId) {}
    public function handle(): void {}
}
