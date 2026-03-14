<?php

namespace App\Services\Inventory\Features;

use Lucid\Units\Feature;
use App\Http\Requests\ReceiveStockRequest;

class ReceiveStockFeature extends Feature
{
    public function handle(ReceiveStockRequest $request): mixed
    {
        $purchaseOrder = $this->run(new GetPurchaseOrderJob(poId: $request->purchase_order_id));

        $receipt = $this->run(new CreateStockReceiptJob(
            purchaseOrderId: $purchaseOrder->id,
            warehouseId: $request->warehouse_id,
            receivedBy: $request->user()->id,
        ));

        foreach ($request->items as $item) {
            $this->run(new AddStockReceiptItemJob(
                receiptId: $receipt->id,
                productId: $item['product_id'],
                quantity: $item['quantity'],
                condition: $item['condition'] ?? 'new',
            ));

            $this->run(new UpdateStockLevelJob(
                productId: $item['product_id'],
                warehouseId: $request->warehouse_id,
                delta: $item['quantity'],
            ));
        }

        $this->run(new UpdatePurchaseOrderStatusJob(poId: $purchaseOrder->id));
        $this->run(new NotifyLowStockResolvedJob(receipt: $receipt));

        return $receipt;
    }
}
