<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class AuthorizeOrderAccessJob extends Job
{
    public function __construct(
        private readonly mixed $order,
        private readonly string $userId,
    ) {}
    public function handle(): void {}
}
