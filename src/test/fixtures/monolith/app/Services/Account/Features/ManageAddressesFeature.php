<?php

namespace App\Services\Account\Features;

use Lucid\Units\Feature;
use Illuminate\Http\Request;

class ManageAddressesFeature extends Feature
{
    public function handle(Request $request): mixed
    {
        return $this->run(new GetCustomerAddressesJob(customerId: $request->user()->id));
    }
}
