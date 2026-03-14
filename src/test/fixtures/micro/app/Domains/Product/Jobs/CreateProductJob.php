<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class CreateProductJob extends Job
{
    public function __construct(
        private readonly string $name,
        private readonly string $slug,
        private readonly string $sku,
        private readonly string $description,
        private readonly string $categoryId,
        private readonly array $attributes = [],
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
