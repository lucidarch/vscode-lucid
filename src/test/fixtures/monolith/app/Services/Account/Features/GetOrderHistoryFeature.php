<?php

namespace App\Services\Account\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class GetOrderHistoryFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        return $this->run(new GetCustomerOrdersJob(
            customerId: $request->user()->id,
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 15),
            status: $request->input('status'),
        ));
    }
}
