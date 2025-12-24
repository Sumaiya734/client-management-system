<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Models\User;
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
    
    public function __construct(UserService $userService)
    {
        $this->service = $userService;
        $this->storeRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,user,accountant,sales,support',
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
            $data = $request->only(['name', 'email', 'role', 'status']);
            if (isset($validationResult['validated_data']['password']) && $validationResult['validated_data']['password']) {
                $data['password'] = Hash::make($validationResult['validated_data']['password']);
            }

            $updatedResource = $this->service->update($id, $data);

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

            // Update user role based on administrator status
            if ($isAdministrator) {
                $user->role = 'admin';
            } else {
                // Set to a standard role, defaulting to 'user'
                $user->role = $request->get('role', 'user');
            }

            $user->save();

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
}