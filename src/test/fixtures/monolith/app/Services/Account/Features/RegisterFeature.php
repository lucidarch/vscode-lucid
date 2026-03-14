<?php

namespace App\Services\Account\Features;

use Lucid\Units\Feature;
use App\Http\Requests\RegisterRequest;

class RegisterFeature extends Feature
{
    public function handle(RegisterRequest $request): mixed
    {
        $this->run(new CheckEmailNotTakenJob(email: $request->email));

        $customer = $this->run(new CreateCustomerJob(
            name: $request->name,
            email: $request->email,
            password: $request->password,
        ));

        $this->run(new CreateCustomerProfileJob(customerId: $customer->id));
        $this->run(new AssignDefaultCustomerGroupJob(customerId: $customer->id));
        $this->run(new SendWelcomeEmailJob(customerId: $customer->id));

        return $this->run(new IssueAuthTokenJob(customerId: $customer->id));
    }
}
