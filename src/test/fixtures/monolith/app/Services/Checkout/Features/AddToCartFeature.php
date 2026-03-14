<?php

namespace App\Services\Checkout\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class AddToCartFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $product = $this->run(new GetProductByIdJob(id: $request->product_id));

        $this->run(new CheckProductAvailabilityJob(
            productId: $product->id,
            variantId: $request->variant_id,
            quantity: $request->integer('quantity', 1),
        ));

        $cart = $this->run(new GetOrCreateCartJob(
            userId: $request->user()->id,
            sessionId: $request->session()->getId(),
        ));

        $cartItem = $this->run(new AddItemToCartJob(
            cartId: $cart->id,
            productId: $product->id,
            variantId: $request->variant_id,
            quantity: $request->integer('quantity', 1),
        ));

        $this->run(new RecalculateCartTotalsJob(cartId: $cart->id));

        return $this->run(new GetCartWithItemsJob(cartId: $cart->id));
    }
}
