<?php

namespace App\Domains\Category\Jobs;

use Lucid\Units\Job;

class GetCategoryBySlugJob extends Job
{
    public function __construct(
        private readonly string $slug,
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
