<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Models\Client;
use App\Services\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ValidationHelper;
use App\Helpers\ResponseHelper;

class ClientController extends BaseAPIController
{
    protected $resourceName = 'Client';
    
    public function __construct(ClientService $clientService)
    {
        $this->service = $clientService;
        $this->storeRules = [
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|string|in:Active,Inactive',
            'address' => 'nullable|string'
        ];
    }
    
    public function update(Request $request, string $id)
    {
        try {
            $resource = $this->service->getById($id);

            if (!$resource) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }

            // Define update rules with unique validation that excludes the current record
            $updateRules = [
                'name' => 'sometimes|string|max:255',
                'company' => 'nullable|string|max:255',
                'email' => 'sometimes|email|unique:clients,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'status' => 'sometimes|string|in:Active,Inactive',
                'address' => 'nullable|string'
            ];

            $validationResult = ValidationHelper::validate($request->all(), $updateRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            $updatedResource = $this->service->update($id, $validationResult['validated_data']);

            return ResponseHelper::success($updatedResource, $this->resourceName . ' updated successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update ' . strtolower($this->resourceName), $e->getMessage());
        }
    }
}