<?php

namespace App\Services\Catalog\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetProductFeature extends Feature
{
    public function handle(Request $request, string $slug): mixed
    {
        $product  = $this->run(new GetProductBySlugJob(slug: $slug));
        $variants = $this->run(new GetProductVariantsJob(productId: $product->id));
        $media    = $this->run(new GetProductMediaJob(productId: $product->id));
        $pricing  = $this->run(new GetProductPricingJob(productId: $product->id, customerId: $request->user()?->id));
        $related  = $this->run(new GetRelatedProductsJob(productId: $product->id, limit: 8));

        $this->run(new IncrementProductViewCountJob(productId: $product->id));

        return compact('product', 'variants', 'media', 'pricing', 'related');
    }
}
