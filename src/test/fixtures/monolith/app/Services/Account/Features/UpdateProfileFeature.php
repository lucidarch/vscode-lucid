<?php

namespace App\Services\Account\Features;

use Lucid\Units\Feature;
use App\Http\Requests\UpdateProfileRequest;

class UpdateProfileFeature extends Feature
{
    public function handle(UpdateProfileRequest $request): mixed
    {
        $customer = $this->run(new GetCustomerByIdJob(customerId: $request->user()->id));

        if ($request->has('email') && $request->email !== $customer->email) {
            $this->run(new CheckEmailNotTakenJob(email: $request->email));
        }

        $customer = $this->run(new UpdateCustomerJob(
            customer: $customer,
            data: $request->validated(),
        ));

        if ($request->has('password')) {
            $this->run(new UpdateCustomerPasswordJob(
                customerId: $customer->id,
                currentPassword: $request->current_password,
                newPassword: $request->password,
            ));
        }

        if ($request->hasFile('avatar')) {
            $this->run(new UpdateCustomerAvatarJob(
                customerId: $customer->id,
                avatar: $request->file('avatar'),
            ));
        }

        return $customer;
    }
}
