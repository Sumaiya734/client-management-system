<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Models\User;
use App\Services\AuditService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;

class UserManagementController extends BaseAPIController
{
    protected $resourceName = 'User';
    protected $auditService;
    
    public function __construct(UserService $userService, AuditService $auditService)
    {
        $this->service = $userService;
        $this->auditService = $auditService;
        $this->storeRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,user,accountant,sales,support',
            'status' => 'string|in:Active,Inactive',
        ];
    }
    
    public function store(Request $request)
    {
        try {
            $validationResult = ValidationHelper::validate($request->all(), $this->storeRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            // Handle password hashing
            $data = $request->only(['name', 'email', 'role']);
            
            // Ensure status is included, default to 'Active' if not provided
            $data['status'] = $request->get('status', 'Active');
            
            if (isset($validationResult['validated_data']['password']) && $validationResult['validated_data']['password']) {
                $data['password'] = Hash::make($validationResult['validated_data']['password']);
            }

            $resource = $this->service->create($data);
            
            // Log the creation action
            $this->auditService->logCreation(
                'User Management',
                "User created: {$resource->name} (ID: {$resource->id})",
                [
                    'name' => $resource->name,
                    'email' => $resource->email,
                    'role' => $resource->role,
                    'status' => $resource->status,
                ]
            );

            return ResponseHelper::created([
                'id' => $resource->id,
                'name' => $resource->name,
                'email' => $resource->email,
                'role' => ucfirst($resource->role),
                'status' => $resource->status,
                'lastLogin' => $resource->last_login_at ? $resource->last_login_at->format('Y-m-d H:i') : 'Never',
                'createdAt' => $resource->created_at ? $resource->created_at->format('Y-m-d H:i') : null,
                'updatedAt' => $resource->updated_at ? $resource->updated_at->format('Y-m-d H:i') : null,
            ], $this->resourceName . ' created successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to create ' . strtolower($this->resourceName), $e->getMessage(), 500);
        }
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
                'name' => 'string|max:255',
                'email' => 'string|email|max:255|unique:users,email,' . $id,
                'password' => 'nullable|string|min:8',
                'role' => 'string|in:admin,user,accountant,sales,support',
                'status' => 'string|in:Active,Inactive',
            ];

            $validationResult = ValidationHelper::validate($request->all(), $updateRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            // Handle password hashing specifically for users
            $data = $request->only(['name', 'email', 'role']);
            
            // Include status if provided
            if ($request->has('status')) {
                $data['status'] = $request->get('status');
            }
            
            if (isset($validationResult['validated_data']['password']) && $validationResult['validated_data']['password']) {
                $data['password'] = Hash::make($validationResult['validated_data']['password']);
            }

            $oldValues = [
                'name' => $resource->name,
                'email' => $resource->email,
                'role' => $resource->role,
                'status' => $resource->status,
            ];
            
            $newValues = [
                'name' => $data['name'] ?? $resource->name,
                'email' => $data['email'] ?? $resource->email,
                'role' => $data['role'] ?? $resource->role,
                'status' => $data['status'] ?? $resource->status,
            ];
            
            $updatedResource = $this->service->update($id, $data);
            
            // Log the update action
            $this->auditService->logUpdate(
                'User Management',
                "User updated: {$updatedResource->name} (ID: {$updatedResource->id})",
                $oldValues,
                $newValues
            );

            // Format the response to match the original format
            return ResponseHelper::success([
                'id' => $updatedResource->id,
                'name' => $updatedResource->name,
                'email' => $updatedResource->email,
                'role' => ucfirst($updatedResource->role),
                'status' => $updatedResource->status,
                'lastLogin' => $updatedResource->last_login_at ? $updatedResource->last_login_at->format('Y-m-d H:i') : 'Never',
                'createdAt' => $updatedResource->created_at ? $updatedResource->created_at->format('Y-m-d H:i') : null,
                'updatedAt' => $updatedResource->updated_at ? $updatedResource->updated_at->format('Y-m-d H:i') : null,
            ], $this->resourceName . ' updated successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update ' . strtolower($this->resourceName), $e->getMessage());
        }
    }
    
    /**
     * Update user permissions
     */
    public function updatePermissions(Request $request, string $id)
    {
        try {
            $user = $this->service->getById($id);

            if (!$user) {
                return ResponseHelper::notFound('User not found');
            }

            $permissions = $request->get('permissions', []);
            $isAdministrator = $request->get('isAdministrator', false);

            $oldRole = $user->role;
            
            // Update user role based on administrator status
            if ($isAdministrator) {
                $user->role = 'admin';
            } else {
                // Set to a standard role, defaulting to 'user'
                $user->role = $request->get('role', 'user');
            }

            $user->save();
            
            // Log the permission update
            $this->auditService->logUpdate(
                'User Management',
                "User permissions updated for: {$user->name} (ID: {$user->id})",
                ['role' => $oldRole],
                ['role' => $user->role]
            );

            return ResponseHelper::success(null, 'Permissions updated successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update permissions', $e->getMessage());
        }
    }

    /**
     * Get user permissions
     */
    public function getPermissions(string $id)
    {
        try {
            $user = $this->service->getById($id);

            if (!$user) {
                return ResponseHelper::notFound('User not found');
            }

            $isAdministrator = $user->role === 'admin';
            $permissions = [];

            if (!$isAdministrator) {
                // For non-admin users, return their role-based permissions
                $permissions = $this->getRoleBasedPermissions($user->role);
            }

            return ResponseHelper::success([
                'isAdministrator' => $isAdministrator,
                'permissions' => $permissions,
                'role' => $user->role
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to retrieve permissions', $e->getMessage());
        }
    }

    /**
     * Get role-based permissions
     */
    private function getRoleBasedPermissions(string $role)
    {
        $permissionMap = [
            'accountant' => [
                'clientManagement' => true,
                'productManagement' => false,
                'purchaseOrders' => false,
                'paymentManagement' => true,
                'currencyManagement' => true,
                'reportsAnalytics' => true,
                'userManagement' => false,
                'notifications' => false,
            ],
            'sales' => [
                'clientManagement' => true,
                'productManagement' => true,
                'purchaseOrders' => true,
                'paymentManagement' => false,
                'currencyManagement' => false,
                'reportsAnalytics' => true,
                'userManagement' => false,
                'notifications' => false,
            ],
            'support' => [
                'clientManagement' => true,
                'productManagement' => false,
                'purchaseOrders' => false,
                'paymentManagement' => false,
                'currencyManagement' => false,
                'reportsAnalytics' => false,
                'userManagement' => false,
                'notifications' => true,
            ],
            'user' => [
                'clientManagement' => false,
                'productManagement' => false,
                'purchaseOrders' => false,
                'paymentManagement' => false,
                'currencyManagement' => false,
                'reportsAnalytics' => false,
                'userManagement' => false,
                'notifications' => false,
            ]
        ];

        return $permissionMap[$role] ?? [];
    }
    
    public function destroy(string $id)
    {
        try {
            $user = $this->service->getById($id);

            if (!$user) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }
            
            $oldValues = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ];

            $result = $this->service->delete($id);

            if ($result) {
                // Log the deletion action
                $this->auditService->logDeletion(
                    'User Management',
                    "User deleted: {$user->name} (ID: {$user->id})",
                    $oldValues
                );
                
                return ResponseHelper::success(null, $this->resourceName . ' deleted successfully');
            } else {
                return ResponseHelper::error('Failed to delete ' . strtolower($this->resourceName));
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to delete ' . strtolower($this->resourceName), $e->getMessage());
        }
    }
}