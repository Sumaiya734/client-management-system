<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $users = User::select('id', 'name', 'email', 'role', 'status', 'last_login_at', 'created_at', 'updated_at')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => ucfirst($user->role),
                        'status' => $user->status ?? 'Active',
                        'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : 'Never',
                        'createdAt' => $user->created_at ? $user->created_at->format('Y-m-d H:i') : null,
                        'updatedAt' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i') : null,
                    ];
                });

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:admin,user,accountant,sales,support',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->status ?? 'Active',
            ]);

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role),
                'status' => $user->status,
                'lastLogin' => 'Never',
                'createdAt' => $user->created_at ? $user->created_at->format('Y-m-d H:i') : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i') : null,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role),
                'status' => $user->status ?? 'Active',
                'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : 'Never',
                'createdAt' => $user->created_at ? $user->created_at->format('Y-m-d H:i') : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i') : null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'string|max:255',
                'email' => 'string|email|max:255|unique:users,email,' . $id,
                'password' => 'nullable|string|min:8',
                'role' => 'string|in:admin,user,accountant,sales,support',
                'status' => 'string|in:Active,Inactive',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            $data = $request->only(['name', 'email', 'role', 'status']);
            if ($request->has('password') && $request->password) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role),
                'status' => $user->status,
                'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : 'Never',
                'createdAt' => $user->created_at ? $user->created_at->format('Y-m-d H:i') : null,
                'updatedAt' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i') : null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user permissions
     */
    public function updatePermissions(Request $request, string $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
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

            return response()->json(['message' => 'Permissions updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user permissions
     */
    public function getPermissions(string $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $isAdministrator = $user->role === 'admin';
            $permissions = [];

            if (!$isAdministrator) {
                // For non-admin users, return their role-based permissions
                $permissions = $this->getRoleBasedPermissions($user->role);
            }

            return response()->json([
                'isAdministrator' => $isAdministrator,
                'permissions' => $permissions,
                'role' => $user->role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve permissions',
                'error' => $e->getMessage()
            ], 500);
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