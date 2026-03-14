<?php

namespace App\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class SearchProductsFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $query = $request->string('q')->trim();
        $facets = $request->input('facets', []);

        $results = $this->run(new SearchProductsJob(
            query: $query,
            facets: $facets,
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 24),
            sortBy: $request->input('sort', 'relevance'),
        ));

        $suggestions = strlen($query) >= 2
            ? $this->run(new GetSearchSuggestionsJob(query: $query, limit: 5))
            : [];

        $this->run(new LogSearchQueryJob(
            query: $query,
            resultCount: $results->total(),
            userId: $request->user()?->id,
        ));

        return compact('results', 'suggestions');
    }
}
