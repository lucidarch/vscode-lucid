<?php

namespace App\Services\Checkout\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class ApplyCouponFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        $cart   = $this->run(new GetCartWithItemsJob(cartId: $request->cart_id));
        $coupon = $this->run(new ValidateCouponCodeJob(code: $request->coupon_code, cartId: $cart->id));

        $discount = $this->run(new ApplyDiscountJob(
            couponCode: $coupon->code,
            subtotal: $cart->subtotal,
            customerId: $request->user()->id,
        ));

        $this->run(new AttachCouponToCartJob(cartId: $cart->id, couponId: $coupon->id, discount: $discount));
        $this->run(new RecalculateCartTotalsJob(cartId: $cart->id));

        return $this->run(new GetCartWithItemsJob(cartId: $cart->id));
    }
}
