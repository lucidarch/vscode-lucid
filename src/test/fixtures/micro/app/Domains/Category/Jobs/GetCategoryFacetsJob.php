<?php

namespace App\Domains\Category\Jobs;

use Lucid\Units\Job;

class GetCategoryFacetsJob extends Job
{
    public function __construct(
        private readonly string $categoryId,
        private readonly array $appliedFilters = [],
    ) {}

    public function handle(): array
    {
        return [];
    }
}
