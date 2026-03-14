<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogSearchQueryJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $query,
        private readonly int $resultCount,
        private readonly ?string $userId = null,
    ) {}
    public function handle(): void {}
}
