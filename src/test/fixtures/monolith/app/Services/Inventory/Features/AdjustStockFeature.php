<?php

namespace App\Services\Inventory\Features;

use Lucid\Units\Feature;
use App\Http\Requests\AdjustStockRequest;

class AdjustStockFeature extends Feature
{
    public function handle(AdjustStockRequest $request): mixed
    {
        $adjustment = $this->run(new CreateStockAdjustmentJob(
            productId: $request->product_id,
            warehouseId: $request->warehouse_id,
            delta: $request->delta,
            reason: $request->reason,
            adjustedBy: $request->user()->id,
        ));

        $this->run(new UpdateStockLevelJob(
            productId: $request->product_id,
            warehouseId: $request->warehouse_id,
            delta: $request->delta,
        ));

        if ($this->run(new IsStockBelowThresholdJob(productId: $request->product_id))) {
            $this->run(new TriggerLowStockAlertJob(productId: $request->product_id));
        }

        return $adjustment;
    }
}
