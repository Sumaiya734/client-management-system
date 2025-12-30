<?php

namespace App\Services;

use App\Repositories\VendorRepository;
use Illuminate\Http\Request;

class VendorService extends BaseService
{
    public function __construct(VendorRepository $vendorRepository)
    {
        parent::__construct($vendorRepository);
    }

    // The base service and repository handle all functionality now
    // Search and pagination are handled by the repository
}