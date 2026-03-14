<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class RemoveProductFromSearchIndexJob extends Job implements ShouldQueue
{
    public function __construct(private readonly string $productId) {}
    public function handle(): void {}
}
