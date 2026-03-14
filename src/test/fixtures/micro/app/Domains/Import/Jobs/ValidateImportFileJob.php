<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;
use Illuminate\Http\UploadedFile;

class ValidateImportFileJob extends Job
{
    public function __construct(
        private readonly UploadedFile $file,
        private readonly string $format = 'csv',
    ) {}
    public function handle(): void {}
}
