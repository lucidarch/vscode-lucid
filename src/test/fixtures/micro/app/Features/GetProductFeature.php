<?php

namespace App\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetProductFeature extends Feature
{
    public function handle(Request $request, string $slug): mixed
    {
        $product = $this->run(new GetProductBySlugJob(slug: $slug));

        $variants = $this->run(new GetProductVariantsJob(productId: $product->id));

        $pricing = $this->run(new GetProductPricingJob(
            productId: $product->id,
            customerId: $request->user()?->id,
        ));

        $media = $this->run(new GetProductMediaJob(productId: $product->id));

        $related = $this->run(new GetRelatedProductsJob(
            productId: $product->id,
            categoryId: $product->category_id,
            limit: 6,
        ));

        $this->run(new IncrementProductViewCountJob(productId: $product->id));

        return compact('product', 'variants', 'pricing', 'media', 'related');
    }
}
