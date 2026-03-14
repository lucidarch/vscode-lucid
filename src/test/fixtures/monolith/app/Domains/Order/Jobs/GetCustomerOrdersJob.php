<?php

namespace App\Domains\Order\Jobs;

use Lucid\Units\Job;

class GetCustomerOrdersJob extends Job
{
    public function __construct(
        private readonly string $customerId,
        private readonly int $page = 1,
        private readonly int $perPage = 15,
        private readonly ?string $status = null,
    ) {}
    public function handle(): mixed { return null; }
}
