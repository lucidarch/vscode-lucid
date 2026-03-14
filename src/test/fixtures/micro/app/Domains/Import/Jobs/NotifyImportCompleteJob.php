<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyImportCompleteJob extends Job implements ShouldQueue
{
    public function __construct(private readonly string $importJobId) {}
    public function handle(): void {}
}
