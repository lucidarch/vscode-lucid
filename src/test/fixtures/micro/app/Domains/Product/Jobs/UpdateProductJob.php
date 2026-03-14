<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class UpdateProductJob extends Job
{
    public function __construct(
        private readonly mixed $product,
        private readonly array $data,
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
