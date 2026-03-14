<?php

namespace App\Domains\Product\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class TrackProductListingViewJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly array $filters,
        private readonly int $resultCount,
    ) {}

    public function handle(): void {}
}
