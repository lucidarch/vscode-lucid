<?php

namespace App\Services\Checkout\Features;

use Lucid\Units\Feature;
use App\Http\Requests\PlaceOrderRequest;

class PlaceOrderFeature extends Feature
{
    public function handle(PlaceOrderRequest $request): mixed
    {
        $cart = $this->run(new GetCartWithItemsJob(cartId: $request->cart_id));

        $this->run(new ValidateCartStillValidJob(cart: $cart));

        $this->run(new ReserveCartInventoryJob(cart: $cart));

        $discount = $request->coupon_code
            ? $this->run(new ApplyDiscountJob(couponCode: $request->coupon_code, subtotal: $cart->subtotal))
            : 0;

        $order = $this->run(new CreateOrderJob(
            cart: $cart,
            userId: $request->user()->id,
            shippingAddressId: $request->shipping_address_id,
            billingAddressId: $request->billing_address_id,
            discount: $discount,
            notes: $request->notes,
        ));

        $this->run(new ProcessPaymentJob(
            orderId: $order->id,
            paymentMethodId: $request->payment_method_id,
            amount: $order->total,
        ));

        $this->run(new ClearCartJob(cartId: $cart->id));
        $this->run(new SendOrderConfirmationJob(orderId: $order->id));

        return $order;
    }
}
