<?php

namespace App\Http\Controllers;

use Lucid\Units\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        return $this->serve(SearchProductsFeature::class);
    }
}
