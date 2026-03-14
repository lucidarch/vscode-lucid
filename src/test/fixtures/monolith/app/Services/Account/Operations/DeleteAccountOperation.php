<?php

namespace App\Services\Account\Operations;

use Lucid\Units\Operation;

class DeleteAccountOperation extends Operation
{
    public function __construct(
        private readonly string $customerId,
        private readonly string $reason,
    ) {}

    public function handle(): void
    {
        $this->run(new CancelActiveOrdersJob(customerId: $this->customerId));
        $this->run(new AnonymizeCustomerDataJob(customerId: $this->customerId));
        $this->run(new RevokeAllAuthTokensJob(customerId: $this->customerId));
        $this->run(new UnsubscribeFromAllEmailsJob(customerId: $this->customerId));
        $this->run(new DeleteCustomerJob(customerId: $this->customerId));
        $this->run(new SendAccountDeletionConfirmationJob(customerId: $this->customerId));
    }
}
