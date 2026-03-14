<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;

class GetProductBySkuJob extends Job
{
    public function __construct(private readonly string $sku) {}
    public function handle(): mixed { return null; }
}
