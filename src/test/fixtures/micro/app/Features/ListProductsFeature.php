<?php

namespace App\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class ListProductsFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $filters = $this->run(new ParseProductFiltersJob(
            query: $request->query(),
        ));

        $products = $this->run(new GetProductsJob(
            filters: $filters,
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 24),
        ));

        $this->run(new TrackProductListingViewJob(
            filters: $filters,
            resultCount: $products->total(),
        ));

        return $products;
    }
}
