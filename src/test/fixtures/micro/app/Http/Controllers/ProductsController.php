<?php

namespace App\Http\Controllers;

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

    public function store(Request $request)
    {
        return $this->serve(CreateProductFeature::class);
    }

    public function update(Request $request, string $id)
    {
        return $this->serve(UpdateProductFeature::class);
    }

    public function destroy(Request $request, string $id)
    {
        return $this->serve(DeleteProductFeature::class);
    }
}
