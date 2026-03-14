<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class IssueAuthTokenJob extends Job
{
    public function __construct(private readonly string $customerId) {}
    public function handle(): string { return ''; }
}
