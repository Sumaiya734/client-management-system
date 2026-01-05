<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Models\Vendor;
use App\Services\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ValidationHelper;
use App\Helpers\ResponseHelper;

class VendorController extends BaseAPIController
{
    protected $resourceName = 'Vendor';
    
    public function __construct(VendorService $vendorService)
    {
        $this->service = $vendorService;
        $this->storeRules = [
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|unique:vendors,email',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|string|in:Active,Inactive',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'contact_person' => 'nullable|string|max:255'
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
                'email' => 'sometimes|email|unique:vendors,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'status' => 'sometimes|string|in:Active,Inactive',
                'address' => 'nullable|string',
                'website' => 'nullable|url|max:255',
                'contact_person' => 'nullable|string|max:255'
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

    /**
     * Search vendors
     */
    public function search(Request $request)
    {
        try {
            $searchTerm = $request->input('search', '');
            $status = $request->input('status', '');
            $limit = $request->input('limit', 50);

            $query = Vendor::query();

            // Apply search filter
            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('company', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('contact_person', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Apply status filter
            if (!empty($status) && $status !== 'All Status') {
                $query->where('status', $status);
            }

            $vendors = $query->limit($limit)->get();

            return ResponseHelper::success($vendors, 'Vendors retrieved successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to search vendors', $e->getMessage());
        }
    }
}