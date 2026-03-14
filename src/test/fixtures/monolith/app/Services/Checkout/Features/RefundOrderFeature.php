<?php

namespace App\Services\Checkout\Features;

use Lucid\Units\Feature;
use App\Http\Requests\RefundOrderRequest;

class RefundOrderFeature extends Feature
{
    public function handle(RefundOrderRequest $request, string $orderId): mixed
    {
        $order = $this->run(new GetOrderByIdJob(orderId: $orderId));

        $this->run(new ValidateRefundEligibilityJob(order: $order, items: $request->items));

        $refund = $this->run(new CreateRefundJob(
            orderId: $order->id,
            items: $request->items,
            reason: $request->reason,
            amount: $request->amount,
        ));

        $this->run(new ProcessRefundPaymentJob(refundId: $refund->id));
        $this->run(new RestoreInventoryFromRefundJob(refundId: $refund->id));
        $this->run(new SendRefundConfirmationJob(refundId: $refund->id));

        return $refund;
    }
}
