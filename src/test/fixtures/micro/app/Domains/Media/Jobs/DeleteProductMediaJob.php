<?php

namespace App\Domains\Media\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;

class DeleteProductMediaJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $productId,
    ) {}

    public function handle(): void {}
}
