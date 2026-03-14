<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class GetCustomerByIdJob extends Job
{
    public function __construct(private readonly string $customerId) {}
    public function handle(): mixed { return null; }
}
