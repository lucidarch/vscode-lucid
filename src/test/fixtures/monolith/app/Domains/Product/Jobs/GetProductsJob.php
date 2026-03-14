<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductsJob extends Job
{
    public function __construct(
        private readonly array $filters = [],
        private readonly int $page = 1,
        private readonly int $perPage = 24,
        private readonly string $sortBy = 'position',
    ) {}

    public function handle(): mixed { return null; }
}
