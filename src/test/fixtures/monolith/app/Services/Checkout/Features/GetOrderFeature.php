<?php

namespace App\Services\Checkout\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetOrderFeature extends Feature
{
    public function handle(Request $request, string $orderId): mixed
    {
        $order    = $this->run(new GetOrderByIdJob(orderId: $orderId));
        $items    = $this->run(new GetOrderItemsJob(orderId: $order->id));
        $timeline = $this->run(new GetOrderTimelineJob(orderId: $order->id));
        $shipment = $this->run(new GetOrderShipmentJob(orderId: $order->id));

        $this->run(new AuthorizeOrderAccessJob(order: $order, userId: $request->user()->id));

        return compact('order', 'items', 'timeline', 'shipment');
    }
}
