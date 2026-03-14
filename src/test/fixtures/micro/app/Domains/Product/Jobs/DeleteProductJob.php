<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class DeleteProductJob extends Job
{
    public function __construct(
        private readonly mixed $product,
    ) {}

    public function handle(): void {}
}
