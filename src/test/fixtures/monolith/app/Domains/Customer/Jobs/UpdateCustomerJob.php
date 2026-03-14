<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class UpdateCustomerJob extends Job
{
    public function __construct(
        private readonly mixed $customer,
        private readonly array $data,
    ) {}
    public function handle(): mixed { return null; }
}
