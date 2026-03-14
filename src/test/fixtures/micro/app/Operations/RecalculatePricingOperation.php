<?php

namespace App\Operations;

use Lucid\Units\Operation;

class RecalculatePricingOperation extends Operation
{
    public function __construct(
        private readonly ?string $categoryId = null,
        private readonly ?string $priceListId = null,
    ) {}

    public function handle(): int
    {
        $products = $this->run(new GetProductsForPricingJob(
            categoryId: $this->categoryId,
        ));

        $updated = 0;
        foreach ($products as $product) {
            $newPrice = $this->run(new CalculateProductPriceJob(
                product: $product,
                priceListId: $this->priceListId,
            ));

            $this->run(new SetProductPricingJob(
                productId: $product->id,
                basePrice: $newPrice,
            ));

            $this->run(new InvalidateProductCacheJob(productId: $product->id));
            $updated++;
        }

        return $updated;
    }
}
