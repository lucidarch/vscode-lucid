<?php

namespace App\Services\Catalog\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class SearchProductsFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $results     = $this->run(new SearchProductsJob(query: $request->string('q'), facets: $request->input('facets', [])));
        $suggestions = $this->run(new GetSearchSuggestionsJob(query: $request->string('q'), limit: 5));

        $this->run(new LogSearchQueryJob(query: $request->string('q'), resultCount: $results->total()));

        return compact('results', 'suggestions');
    }
}
