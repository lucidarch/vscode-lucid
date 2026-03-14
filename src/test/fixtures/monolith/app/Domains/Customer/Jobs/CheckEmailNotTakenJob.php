<?php

namespace App\Domains\Customer\Jobs;

use Lucid\Units\Job;

class CheckEmailNotTakenJob extends Job
{
    public function __construct(private readonly string $email) {}
    public function handle(): void {}
}
