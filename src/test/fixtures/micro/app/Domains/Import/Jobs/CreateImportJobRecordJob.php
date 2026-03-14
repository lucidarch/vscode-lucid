<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;

class CreateImportJobRecordJob extends Job
{
    public function __construct(
        private readonly string $filename,
        private readonly string $userId,
        private readonly int $totalRows,
    ) {}
    public function handle(): mixed { return null; }
}
