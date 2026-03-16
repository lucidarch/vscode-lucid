<?php

namespace App\Domains\Notification\Jobs;

use Lucid\Units\Job;

class SendPasswordResetEmailJob extends Job
{
    public function __construct(
        private readonly string $email,
        private readonly string $resetToken,
    ) {}

    public function handle(): void
    {
        // TODO: not yet wired into any Feature
    }
}
