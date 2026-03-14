<?php

namespace App\Features;

use Lucid\Units\Feature;
use App\Http\Requests\UpdateProductRequest;

class UpdateProductFeature extends Feature
{
    public function handle(UpdateProductRequest $request, string $id): mixed
    {
        $product = $this->run(new GetProductByIdJob(id: $id));

        $product = $this->run(new UpdateProductJob(
            product: $product,
            data: $request->validated(),
        ));

        if ($request->has('base_price')) {
            $this->run(new SetProductPricingJob(
                productId: $product->id,
                basePrice: $request->base_price,
                compareAtPrice: $request->compare_at_price,
                currency: $request->currency ?? 'USD',
            ));
        }

        if ($request->hasFile('images')) {
            $this->run(new AttachProductImagesJob(
                productId: $product->id,
                images: $request->file('images'),
            ));
        }

        $this->run(new ReindexProductInSearchJob(productId: $product->id));
        $this->run(new InvalidateProductCacheJob(productId: $product->id));

        return $product;
    }
}
