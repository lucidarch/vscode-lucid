<?php

namespace App\Services\Shipping\Features;

use Lucid\Units\Feature;
use App\Http\Requests\CreateShipmentRequest;

class CreateShipmentFeature extends Feature
{
    public function handle(CreateShipmentRequest $request): mixed
    {
        $order = $this->run(new GetOrderByIdJob(orderId: $request->order_id));

        $label = $this->run(new GenerateShippingLabelJob(
            orderId: $order->id,
            carrierId: $request->carrier_id,
            serviceCode: $request->service_code,
        ));

        $shipment = $this->run(new CreateShipmentRecordJob(
            orderId: $order->id,
            carrier: $request->carrier,
            trackingNumber: $label->tracking_number,
            labelUrl: $label->url,
        ));

        $this->run(new UpdateOrderStatusJob(orderId: $order->id, status: 'shipped'));
        $this->run(new SendShipmentNotificationJob(orderId: $order->id, trackingNumber: $label->tracking_number));

        return $shipment;
    }
}
