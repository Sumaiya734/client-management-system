<?php

namespace App\Services;

use App\Repositories\ClientRepository;
use Illuminate\Http\Request;

class ClientService extends BaseService
{
    public function __construct(ClientRepository $clientRepository)
    {
        parent::__construct($clientRepository);
    }

    // The base service and repository handle all functionality now
    // Search and pagination are handled by the repository
}