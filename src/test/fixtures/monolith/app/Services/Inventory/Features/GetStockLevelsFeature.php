<?php

namespace App\Services\Inventory\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetStockLevelsFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        return $this->run(new GetStockLevelsJob(
            productIds: $request->input('product_ids', []),
            warehouseId: $request->warehouse_id,
            lowStockThreshold: $request->integer('low_stock_threshold', 10),
        ));
    }
}
