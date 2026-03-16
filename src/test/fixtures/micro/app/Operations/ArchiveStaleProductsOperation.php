<?php

namespace App\Operations;

use Lucid\Units\Operation;

class ArchiveStaleProductsOperation extends Operation
{
    public function __construct(
        private readonly int $olderThanDays = 90,
    ) {}

    public function handle(): int
    {
        // TODO: not yet called from any Feature
        return 0;
    }
}
