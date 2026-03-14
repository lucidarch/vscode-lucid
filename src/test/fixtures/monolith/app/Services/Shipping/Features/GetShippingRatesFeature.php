<?php

namespace App\Services\Shipping\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetShippingRatesFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $address = $this->run(new GetAddressJob(addressId: $request->address_id));
        $cart    = $this->run(new GetCartWithItemsJob(cartId: $request->cart_id));

        $rates = $this->run(new FetchShippingRatesJob(
            destination: $address,
            items: $cart->items,
            weight: $this->run(new CalculateCartWeightJob(cart: $cart)),
        ));

        return $this->run(new SortShippingRatesJob(rates: $rates));
    }
}
