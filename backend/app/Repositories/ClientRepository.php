<?php

namespace App\Repositories;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientRepository extends BaseRepository
{
    public function __construct(Client $client)
    {
        parent::__construct($client);
    }

    public function search(Request $request)
    {
        $query = $this->model->newQuery();

        // Search by cli_name, company, or email
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('cli_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function paginate(Request $request, $perPage = 10)
    {
        $query = $this->model->newQuery();

        // Search by cli_name, company, or email
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('cli_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}