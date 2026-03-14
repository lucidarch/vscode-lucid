<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;

class ParseImportFileJob extends Job
{
    public function __construct(
        private readonly string $filePath,
        private readonly array $mapping,
    ) {}
    public function handle(): array { return []; }
}
