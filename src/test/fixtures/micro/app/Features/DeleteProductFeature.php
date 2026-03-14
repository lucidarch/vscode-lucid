<?php

namespace App\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class DeleteProductFeature extends Feature
{
    public function handle(Request $request, string $id): mixed
    {
        $product = $this->run(new GetProductByIdJob(id: $id));

        $this->run(new CheckProductHasActiveOrdersJob(productId: $product->id));

        $this->run(new RemoveProductFromSearchIndexJob(productId: $product->id));
        $this->run(new ReleaseProductInventoryJob(productId: $product->id));
        $this->run(new DeleteProductMediaJob(productId: $product->id));
        $this->run(new DeleteProductJob(product: $product));

        return response()->noContent();
    }
}
