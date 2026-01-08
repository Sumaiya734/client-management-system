<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserRepository extends BaseRepository
{
    public function __construct(User $user)
    {
        parent::__construct($user);
    }

    public function create(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $user = $this->find($id);
        if ($user) {
            // Hash password if provided
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                // Remove password from update if not provided to avoid setting to null
                unset($data['password']);
            }
            
            $user->update($data);
            return $user;
        }
        return null;
    }

    public function search(Request $request)
    {
        $query = $this->model->newQuery();

        // Search by name or email
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->get('role') !== 'All Roles') {
            $query->where('role', $request->get('role'));
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

        // Search by name or email
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->get('role') !== 'All Roles') {
            $query->where('role', $request->get('role'));
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}