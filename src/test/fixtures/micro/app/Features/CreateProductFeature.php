<?php

namespace App\Features;

use Lucid\Units\Feature;
use App\Http\Requests\CreateProductRequest;

class CreateProductFeature extends Feature
{
    public function handle(CreateProductRequest $request): mixed
    {
        $this->run(new ValidateProductSkuUniqueJob(sku: $request->sku));

        $product = $this->run(new CreateProductJob(
            name: $request->name,
            slug: $request->slug,
            sku: $request->sku,
            description: $request->description,
            categoryId: $request->category_id,
            attributes: $request->attributes ?? [],
        ));

        if ($request->hasFile('images')) {
            $this->run(new AttachProductImagesJob(
                productId: $product->id,
                images: $request->file('images'),
            ));
        }

        $this->run(new SetProductPricingJob(
            productId: $product->id,
            basePrice: $request->base_price,
            compareAtPrice: $request->compare_at_price,
            currency: $request->currency ?? 'USD',
        ));

        $this->run(new InitializeProductInventoryJob(
            productId: $product->id,
            initialStock: $request->integer('initial_stock', 0),
        ));

        $this->run(new IndexProductInSearchJob(productId: $product->id));

        return $product;
    }
}
