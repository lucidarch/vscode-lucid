<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetRelatedProductsJob extends Job
{
    public function __construct(
        private readonly string $productId,
        private readonly int $limit = 8,
    ) {}
    public function handle(): array { return []; }
}
