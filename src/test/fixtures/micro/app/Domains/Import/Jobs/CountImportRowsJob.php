<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;
use Illuminate\Http\UploadedFile;

class CountImportRowsJob extends Job
{
    public function __construct(private readonly UploadedFile $file) {}
    public function handle(): int { return 0; }
}
