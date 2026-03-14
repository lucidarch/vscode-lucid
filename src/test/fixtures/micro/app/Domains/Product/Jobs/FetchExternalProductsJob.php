<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class FetchExternalProductsJob extends Job
{
    public function __construct(
        private readonly string $source,
        private readonly array $options = [],
    ) {}
    public function handle(): array { return []; }
}
