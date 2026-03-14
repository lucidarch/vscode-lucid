<?php

namespace App\Domains\Category\Jobs;

use Lucid\Units\Job;

class GetProductsByCategoryJob extends Job
{
    public function __construct(
        private readonly string $categoryId,
        private readonly bool $includeDescendants = false,
        private readonly int $page = 1,
        private readonly int $perPage = 24,
        private readonly string $sortBy = 'position',
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
