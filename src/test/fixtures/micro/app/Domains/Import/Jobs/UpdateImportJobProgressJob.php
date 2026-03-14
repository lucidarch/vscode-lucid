<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;

class UpdateImportJobProgressJob extends Job
{
    public function __construct(
        private readonly string $importJobId,
        private readonly ?int $total = null,
        private readonly ?int $processed = null,
        private readonly ?string $status = null,
    ) {}
    public function handle(): void {}
}
