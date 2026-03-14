<?php

namespace App\Services\Catalog\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class ListProductsFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $products = $this->run(new GetProductsJob(
            filters: $request->only(['category', 'brand', 'min_price', 'max_price', 'in_stock']),
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 24),
            sortBy: $request->input('sort', 'position'),
        ));

        return $products;
    }
}
