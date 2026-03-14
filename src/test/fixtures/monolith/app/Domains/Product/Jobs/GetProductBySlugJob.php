<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductBySlugJob extends Job
{
    public function __construct(private readonly string $slug) {}
    public function handle(): mixed { return null; }
}
