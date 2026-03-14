<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;

class FinalizeImportJobJob extends Job
{
    public function __construct(private readonly string $importJobId) {}
    public function handle(): void {}
}
