<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

abstract class BaseAPIController extends Controller
{
    /**
     * Service instance to be used by the controller
     */
    protected $service;

    /**
     * Resource name for response messages
     */
    protected $resourceName;

    /**
     * Validation rules for store operation
     */
    protected $storeRules = [];

    /**
     * Validation rules for update operation
     */
    protected $updateRules = [];

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $resources = $this->service->getAll();
            return ResponseHelper::success($resources, $this->resourceName . ' retrieved successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to retrieve ' . strtolower($this->resourceName), $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validationResult = ValidationHelper::validate($request->all(), $this->storeRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            $resource = $this->service->create($validationResult['validated_data']);

            return ResponseHelper::created($resource, $this->resourceName . ' created successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to create ' . strtolower($this->resourceName), $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $resource = $this->service->getById($id);

            if (!$resource) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }

            return ResponseHelper::success($resource, $this->resourceName . ' retrieved successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to retrieve ' . strtolower($this->resourceName), $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $resource = $this->service->getById($id);

            if (!$resource) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }

            $validationResult = ValidationHelper::validate($request->all(), $this->updateRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            $updatedResource = $this->service->update($id, $validationResult['validated_data']);

            return ResponseHelper::success($updatedResource, $this->resourceName . ' updated successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update ' . strtolower($this->resourceName), $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $resource = $this->service->getById($id);

            if (!$resource) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }

            $result = $this->service->delete($id);

            if ($result) {
                return ResponseHelper::success(null, $this->resourceName . ' deleted successfully');
            } else {
                return ResponseHelper::error('Failed to delete ' . strtolower($this->resourceName));
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to delete ' . strtolower($this->resourceName), $e->getMessage());
        }
    }

    /**
     * Search resources with filters
     */
    public function search(Request $request)
    {
        try {
            $resources = $this->service->search($request);
            return ResponseHelper::success($resources, $this->resourceName . ' retrieved successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to search ' . strtolower($this->resourceName), $e->getMessage());
        }
    }

    /**
     * Get resources with pagination
     */
    public function paginate(Request $request)
    {
        try {
            $resources = $this->service->paginate($request);
            return ResponseHelper::success($resources, $this->resourceName . ' retrieved successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to retrieve ' . strtolower($this->resourceName), $e->getMessage());
        }
    }
}