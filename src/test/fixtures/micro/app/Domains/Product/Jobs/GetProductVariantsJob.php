<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductVariantsJob extends Job
{
    public function __construct(
        private readonly string $productId,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
