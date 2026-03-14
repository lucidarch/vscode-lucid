<?php

namespace App\Services\Checkout\Operations;

use Lucid\Units\Operation;

class FulfillOrderOperation extends Operation
{
    public function __construct(
        private readonly string $orderId,
    ) {}

    public function handle(): void
    {
        $order = $this->run(new GetOrderByIdJob(orderId: $this->orderId));

        $this->run(new DeductInventoryForOrderJob(orderId: $order->id));
        $this->run(new CreateShipmentJob(orderId: $order->id));
        $this->run(new UpdateOrderStatusJob(orderId: $order->id, status: 'fulfilled'));
        $this->run(new SendShipmentNotificationJob(orderId: $order->id));
    }
}
