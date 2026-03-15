<?php

namespace App\Services\Catalog\Http\Controllers;

use Lucid\Units\Controller;
use Illuminate\Http\Request;

class ProductsController extends Controller
{
    public function index(Request $request)
    {
        return $this->serve(ListProductsFeature::class);
    }

    public function show(Request $request, string $slug)
    {
        return $this->serve(GetProductFeature::class);
    }

    public function search(Request $request)
    {
        return $this->serve(SearchProductsFeature::class);
    }
}
