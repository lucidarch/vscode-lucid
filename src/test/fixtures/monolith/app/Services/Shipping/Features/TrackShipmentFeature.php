<?php

namespace App\Services\Shipping\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class TrackShipmentFeature extends Feature
{
    public function handle(Request $request, string $trackingNumber): mixed
    {
        $shipment = $this->run(new GetShipmentByTrackingNumberJob(trackingNumber: $trackingNumber));

        $events = $this->run(new FetchTrackingEventsJob(
            trackingNumber: $trackingNumber,
            carrier: $shipment->carrier,
        ));

        $this->run(new SyncTrackingEventsJob(shipmentId: $shipment->id, events: $events));

        return compact('shipment', 'events');
    }
}
