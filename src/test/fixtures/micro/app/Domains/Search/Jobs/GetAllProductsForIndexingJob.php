<?php

namespace App\Domains\Search\Jobs;

use Lucid\Units\Job;

class GetAllProductsForIndexingJob extends Job
{
    public function __construct(
        private readonly ?string $categoryId = null,
    ) {}
    public function handle(): array { return []; }
}
