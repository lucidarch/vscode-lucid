<?php

namespace App\Operations;

use Lucid\Units\Operation;

class SyncProductCatalogOperation extends Operation
{
    public function __construct(
        private readonly string $source,
        private readonly array $options = [],
    ) {}

    public function handle(): array
    {
        $products = $this->run(new FetchExternalProductsJob(source: $this->source));

        $results = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];

        foreach ($products as $data) {
            $existing = $this->run(new GetProductBySkuJob(sku: $data['sku']));

            if ($existing) {
                $this->run(new UpdateProductJob(product: $existing, data: $data));
                $results['updated']++;
            } else {
                $this->run(new CreateProductJob(...$data));
                $results['created']++;
            }

            $this->run(new ReindexProductInSearchJob(productId: $data['id']));
        }

        return $results;
    }
}
