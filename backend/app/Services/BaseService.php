<?php

namespace App\Services;

use App\Repositories\BaseRepositoryInterface;
use Illuminate\Http\Request;

class BaseService
{
    protected $repository;

    public function __construct(BaseRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all records
     */
    public function getAll()
    {
        return $this->repository->all();
    }

    /**
     * Get record by ID
     */
    public function getById($id)
    {
        return $this->repository->find($id);
    }

    /**
     * Create a new record
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update an existing record
     */
    public function update($id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Delete a record
     */
    public function delete($id)
    {
        return $this->repository->delete($id);
    }

    /**
     * Search records with filters
     */
    public function search(Request $request)
    {
        return $this->repository->search($request);
    }

    /**
     * Paginate records with filters
     */
    public function paginate(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        return $this->repository->paginate($request, $perPage);
    }
}