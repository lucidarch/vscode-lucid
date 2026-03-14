<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetSearchSuggestionsJob extends Job
{
    public function __construct(
        private readonly string $query,
        private readonly int $limit = 5,
    ) {}
    public function handle(): array { return []; }
}
