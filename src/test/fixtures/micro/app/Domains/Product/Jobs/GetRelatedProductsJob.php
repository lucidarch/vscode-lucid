<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetRelatedProductsJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly string $categoryId,
        private readonly int $limit = 6,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
