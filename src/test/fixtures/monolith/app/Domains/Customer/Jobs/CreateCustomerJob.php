<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class CreateCustomerJob extends Job
{
    public function __construct(
        private readonly string $name,
        private readonly string $email,
        private readonly string $password,
    ) {}
    public function handle(): mixed { return null; }
}
