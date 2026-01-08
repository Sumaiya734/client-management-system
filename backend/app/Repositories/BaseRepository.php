<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class BaseRepository implements BaseRepositoryInterface
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->orderBy('created_at', 'desc')->get();
    }

    public function find($id)
    {
        return $this->model->find($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $model = $this->find($id);
        if ($model) {
            $model->update($data);
            return $model;
        }
        return null;
    }

    public function delete($id)
    {
        $model = $this->find($id);
        if ($model) {
            return $model->delete();
        }
        return false;
    }

    public function search(Request $request)
    {
        $query = $this->model->newQuery();

        // Add search functionality - this can be overridden in child classes
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Add status filter if available
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function paginate(Request $request, $perPage = 10)
    {
        $query = $this->model->newQuery();

        // Add search functionality
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Add status filter if available
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function with(array $relations)
    {
        return $this->model->with($relations);
    }

    public function where(array $conditions)
    {
        $query = $this->model->newQuery();
        foreach ($conditions as $column => $value) {
            $query->where($column, $value);
        }
        return $query;
    }
}