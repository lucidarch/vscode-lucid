<?php

namespace App\Domains\Category\Jobs;

use Lucid\Units\Job;

class GetCategoryBreadcrumbsJob extends Job
{
    public function __construct(
        private readonly string $categoryId,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
