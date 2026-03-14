<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class GetCustomerByEmailJob extends Job
{
    public function __construct(private readonly string $email) {}
    public function handle(): mixed { return null; }
}
