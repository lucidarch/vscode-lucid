<?php

namespace App\Domains\Notification\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendWelcomeEmailJob extends Job implements ShouldQueue
{
    public function __construct(private readonly string $customerId) {}
    public function handle(): void {}
}
