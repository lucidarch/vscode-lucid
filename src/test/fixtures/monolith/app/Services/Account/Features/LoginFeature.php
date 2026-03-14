<?php

namespace App\Services\Account\Features;

use Lucid\Units\Feature;
use App\Http\Requests\LoginRequest;

class LoginFeature extends Feature
{
    public function handle(LoginRequest $request): mixed
    {
        $this->run(new CheckLoginRateLimitJob(ip: $request->ip(), email: $request->email));

        $customer = $this->run(new GetCustomerByEmailJob(email: $request->email));

        $this->run(new VerifyCustomerPasswordJob(customer: $customer, password: $request->password));
        $this->run(new CheckCustomerNotSuspendedJob(customerId: $customer->id));

        $this->run(new UpdateLastLoginJob(customerId: $customer->id, ip: $request->ip()));

        return $this->run(new IssueAuthTokenJob(customerId: $customer->id));
    }
}
