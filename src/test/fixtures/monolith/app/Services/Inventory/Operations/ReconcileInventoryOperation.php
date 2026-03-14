<?php

namespace App\Services\Inventory\Operations;

use Lucid\Units\Operation;

class ReconcileInventoryOperation extends Operation
{
    public function __construct(
        private readonly string $warehouseId,
        private readonly string $countSheetId,
    ) {}

    public function handle(): array
    {
        $countSheet  = $this->run(new GetCountSheetJob(countSheetId: $this->countSheetId));
        $systemStock = $this->run(new GetWarehouseStockSnapshotJob(warehouseId: $this->warehouseId));

        $discrepancies = $this->run(new CalculateInventoryDiscrepanciesJob(
            counted: $countSheet->items,
            system: $systemStock,
        ));

        foreach ($discrepancies as $discrepancy) {
            $this->run(new CreateStockAdjustmentJob(
                productId: $discrepancy->product_id,
                warehouseId: $this->warehouseId,
                delta: $discrepancy->delta,
                reason: 'reconciliation',
            ));

            $this->run(new UpdateStockLevelJob(
                productId: $discrepancy->product_id,
                warehouseId: $this->warehouseId,
                delta: $discrepancy->delta,
            ));
        }

        $this->run(new CloseCountSheetJob(countSheetId: $this->countSheetId));

        return $discrepancies;
    }
}
