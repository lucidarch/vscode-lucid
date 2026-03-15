<?php

namespace App\Services\Checkout\Http\Controllers;

use Lucid\Units\Controller;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    public function show(Request $request, string $id)
    {
        return $this->serve(GetOrderFeature::class);
    }

    public function store(Request $request)
    {
        return $this->serve(PlaceOrderFeature::class);
    }

    public function refund(Request $request, string $id)
    {
        return $this->serve(RefundOrderFeature::class);
    }
}
