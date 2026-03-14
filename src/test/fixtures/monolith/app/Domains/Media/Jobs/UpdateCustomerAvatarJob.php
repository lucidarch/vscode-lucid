<?php

namespace App\Domains\Media\Jobs;

use Lucid\Units\Job;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\UploadedFile;

class UpdateCustomerAvatarJob extends Job implements ShouldQueue
{
    public function __construct(
        private readonly string $customerId,
        private readonly UploadedFile $avatar,
    ) {}
    public function handle(): string { return ''; }
}
