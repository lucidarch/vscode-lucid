<?php

namespace App\Domains\Media\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class AttachProductImagesJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $productId,
        private readonly array $images,
    ) {}

    public function handle(): void {}
}
