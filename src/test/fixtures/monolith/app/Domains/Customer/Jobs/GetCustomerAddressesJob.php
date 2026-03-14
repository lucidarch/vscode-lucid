<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class GetCustomerAddressesJob extends Job
{
    public function __construct(private readonly string $customerId) {}
    public function handle(): array { return []; }
}
