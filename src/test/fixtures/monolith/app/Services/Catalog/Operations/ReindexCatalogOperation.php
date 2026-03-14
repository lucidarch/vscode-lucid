<?php

namespace App\Services\Catalog\Operations;

use Lucid\Units\Operation;

class ReindexCatalogOperation extends Operation
{
    public function __construct(
        private readonly bool $fullReindex = false,
    ) {}

    public function handle(): int
    {
        if ($this->fullReindex) {
            $this->run(new ClearSearchIndexJob());
        }

        $products = $this->run(new GetAllActiveProductsJob());
        $indexed = 0;

        foreach ($products as $product) {
            $this->run(new IndexProductInSearchJob(productId: $product->id));
            $indexed++;
        }

        return $indexed;
    }
}
