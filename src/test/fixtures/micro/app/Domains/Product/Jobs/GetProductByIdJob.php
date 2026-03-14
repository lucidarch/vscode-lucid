<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductByIdJob extends Job
{
    public function __construct(
        private readonly string $id,
    ) {}

    public function handle(): mixed
    {
        return null;
    }
}
