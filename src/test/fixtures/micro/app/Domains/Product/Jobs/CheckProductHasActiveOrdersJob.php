<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class CheckProductHasActiveOrdersJob extends Job
{
    public function __construct(
        private readonly string $productId,
    ) {}

    public function handle(): void {}
}
