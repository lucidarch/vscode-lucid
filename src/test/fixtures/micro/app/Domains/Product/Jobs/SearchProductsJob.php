<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class SearchProductsJob extends Job
{
    public function __construct(
        private readonly string $query,
        private readonly array $facets = [],
        private readonly int $page = 1,
        private readonly int $perPage = 24,
        private readonly string $sortBy = 'relevance',
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
