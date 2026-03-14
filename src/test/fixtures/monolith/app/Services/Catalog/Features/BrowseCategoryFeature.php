<?php

namespace App\Services\Catalog\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class BrowseCategoryFeature extends Feature
{
    public function handle(Request $request, string $slug): mixed
    {
        $category    = $this->run(new GetCategoryBySlugJob(slug: $slug));
        $breadcrumbs = $this->run(new GetCategoryBreadcrumbsJob(categoryId: $category->id));
        $children    = $this->run(new GetSubcategoriesJob(parentId: $category->id));
        $products    = $this->run(new GetProductsByCategoryJob(categoryId: $category->id, page: $request->integer('page', 1)));
        $facets      = $this->run(new GetCategoryFacetsJob(categoryId: $category->id));

        return compact('category', 'breadcrumbs', 'children', 'products', 'facets');
    }
}
