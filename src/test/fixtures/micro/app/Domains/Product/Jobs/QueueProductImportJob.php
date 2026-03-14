<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class QueueProductImportJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $importJobId,
        private readonly string $filePath,
        private readonly array $mapping = [],
        private readonly array $options = [],
    ) {}

    public function handle(): void {}
}
