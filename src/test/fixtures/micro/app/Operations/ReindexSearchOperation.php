<?php

namespace App\Operations;

use Lucid\Units\Operation;

class ReindexSearchOperation extends Operation
{
    public function __construct(
        private readonly bool $fullReindex = false,
        private readonly ?string $categoryId = null,
    ) {}

    public function handle(): int
    {
        if ($this->fullReindex) {
            $this->run(new ClearSearchIndexJob());
        }

        $products = $this->run(new GetAllProductsForIndexingJob(
            categoryId: $this->categoryId,
        ));

        $indexed = 0;
        foreach ($products as $product) {
            $this->run(new IndexProductInSearchJob(productId: $product->id));
            $indexed++;
        }

        return $indexed;
    }
}
