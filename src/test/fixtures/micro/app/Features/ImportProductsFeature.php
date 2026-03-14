<?php

namespace App\Features;

use Lucid\Units\Feature;
use App\Http\Requests\ImportProductsRequest;

class ImportProductsFeature extends Feature
{
    public function handle(ImportProductsRequest $request): mixed
    {
        $file = $request->file('file');

        $this->run(new ValidateImportFileJob(
            file: $file,
            format: $request->input('format', 'csv'),
        ));

        $importJob = $this->run(new CreateImportJobRecordJob(
            filename: $file->getClientOriginalName(),
            userId: $request->user()->id,
            totalRows: $this->run(new CountImportRowsJob(file: $file)),
        ));

        $this->run(new QueueProductImportJob(
            importJobId: $importJob->id,
            filePath: $file->store('imports'),
            mapping: $request->input('column_mapping', []),
            options: $request->input('options', []),
        ));

        return $importJob;
    }
}
