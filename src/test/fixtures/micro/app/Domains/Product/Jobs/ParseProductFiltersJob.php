<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class ParseProductFiltersJob extends Job
{
    public function __construct(
        private readonly array $query,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
