<?php

namespace App\Domains\Import\Jobs;

use Lucid\Units\Job;

class UpsertProductFromRowJob extends Job
{
    public function __construct(private readonly array $row) {}
    public function handle(): mixed { return null; }
}
