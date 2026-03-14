<?php

namespace App\Operations;

use Lucid\Units\Operation;

class ImportProductsOperation extends Operation
{
    public function __construct(
        private readonly string $importJobId,
        private readonly string $filePath,
        private readonly array $mapping,
    ) {}

    public function handle(): void
    {
        $rows = $this->run(new ParseImportFileJob(
            filePath: $this->filePath,
            mapping: $this->mapping,
        ));

        $this->run(new UpdateImportJobProgressJob(
            importJobId: $this->importJobId,
            total: count($rows),
            status: 'processing',
        ));

        foreach ($rows as $index => $row) {
            $this->run(new UpsertProductFromRowJob(row: $row));
            $this->run(new UpdateImportJobProgressJob(
                importJobId: $this->importJobId,
                processed: $index + 1,
            ));
        }

        $this->run(new FinalizeImportJobJob(importJobId: $this->importJobId));
        $this->run(new NotifyImportCompleteJob(importJobId: $this->importJobId));
    }
}
