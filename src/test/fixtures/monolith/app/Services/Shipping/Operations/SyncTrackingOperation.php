<?php

namespace App\Services\Shipping\Operations;

use Lucid\Units\Operation;

class SyncTrackingOperation extends Operation
{
    public function handle(): int
    {
        $shipments = $this->run(new GetShipmentsInTransitJob());
        $synced = 0;

        foreach ($shipments as $shipment) {
            $events = $this->run(new FetchTrackingEventsJob(
                trackingNumber: $shipment->tracking_number,
                carrier: $shipment->carrier,
            ));

            $this->run(new SyncTrackingEventsJob(shipmentId: $shipment->id, events: $events));

            if ($this->run(new IsShipmentDeliveredJob(shipmentId: $shipment->id))) {
                $this->run(new MarkShipmentDeliveredJob(shipmentId: $shipment->id));
                $this->run(new UpdateOrderStatusJob(orderId: $shipment->order_id, status: 'delivered'));
                $this->run(new SendDeliveryConfirmationJob(orderId: $shipment->order_id));
            }

            $synced++;
        }

        return $synced;
    }
}
