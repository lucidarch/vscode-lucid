<?php

namespace App\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class BrowseCategoryFeature extends Feature
{
    public function handle(Request $request, string $categorySlug): mixed
    {
        $category = $this->run(new GetCategoryBySlugJob(slug: $categorySlug));

        $breadcrumbs = $this->run(new GetCategoryBreadcrumbsJob(categoryId: $category->id));

        $subcategories = $this->run(new GetSubcategoriesJob(parentId: $category->id));

        $products = $this->run(new GetProductsByCategoryJob(
            categoryId: $category->id,
            includeDescendants: true,
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 24),
            sortBy: $request->input('sort', 'position'),
        ));

        $facets = $this->run(new GetCategoryFacetsJob(
            categoryId: $category->id,
            appliedFilters: $request->input('filters', []),
        ));

        return compact('category', 'breadcrumbs', 'subcategories', 'products', 'facets');
    }
}
