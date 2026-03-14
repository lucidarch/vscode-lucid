<?php

namespace App\Domains\Category\Jobs;

use Lucid\Units\Job;

class GetSubcategoriesJob extends Job
{
    public function __construct(
        private readonly string $parentId,
        private readonly bool $recursive = false,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
