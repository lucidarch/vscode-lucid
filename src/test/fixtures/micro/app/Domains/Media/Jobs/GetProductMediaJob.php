<?php

namespace App\Domains\Media\Jobs;

use Lucid\Units\Job;

class GetProductMediaJob extends Job
{
    public function __construct(
        private readonly string $productId,
    ) {}

    public function handle(): array
    {
        return [];
    }
}
