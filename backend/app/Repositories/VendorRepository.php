<?php

namespace App\Repositories;

use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorRepository extends BaseRepository
{
    public function __construct(Vendor $vendor)
    {
        parent::__construct($vendor);
    }

    public function search(Request $request)
    {
        $query = $this->model->newQuery();

        // Search by name, company, email, or contact_person
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->get();
    }

    public function paginate(Request $request, $perPage = 10)
    {
        $query = $this->model->newQuery();

        // Search by name, company, email, or contact_person
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->paginate($perPage);
    }
}