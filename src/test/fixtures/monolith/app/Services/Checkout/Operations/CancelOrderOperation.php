<?php

namespace App\Services\Checkout\Operations;

use Lucid\Units\Operation;

class CancelOrderOperation extends Operation
{
    public function __construct(
        private readonly string $orderId,
        private readonly string $reason,
        private readonly bool $refund = true,
    ) {}

    public function handle(): void
    {
        $order = $this->run(new GetOrderByIdJob(orderId: $this->orderId));

        $this->run(new UpdateOrderStatusJob(orderId: $order->id, status: 'cancelled'));
        $this->run(new ReleaseInventoryForOrderJob(orderId: $order->id));

        if ($this->refund && $order->payment_status === 'paid') {
            $this->run(new ProcessRefundPaymentJob(orderId: $order->id));
        }

        $this->run(new SendOrderCancellationJob(orderId: $order->id, reason: $this->reason));
    }
}
