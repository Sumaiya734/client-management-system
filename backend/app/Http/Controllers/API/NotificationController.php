<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $notifications = Notification::with('client', 'user')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $notifications,
                'message' => 'Notifications retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
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
                'type' => 'required|string|max:255',
                'recipient' => 'required|string|max:255',
                'client' => 'required|string|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'method' => 'required|string|in:Email,SMS,Push,In-App',
                'status' => 'required|string|in:Pending,Sent,Failed,Read',
                'sent_at' => 'nullable|date',
                'client_id' => 'nullable|exists:clients,id',
                'user_id' => 'nullable|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $notification = Notification::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification',
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
            $notification = Notification::with('client', 'user')->find($id);

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notification',
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
            $notification = Notification::find($id);

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'type' => 'sometimes|string|max:255',
                'recipient' => 'sometimes|string|max:255',
                'client' => 'sometimes|string|max:255',
                'subject' => 'sometimes|string|max:255',
                'message' => 'sometimes|string',
                'method' => 'sometimes|string|in:Email,SMS,Push,In-App',
                'status' => 'sometimes|string|in:Pending,Sent,Failed,Read',
                'sent_at' => 'nullable|date',
                'client_id' => 'nullable|exists:clients,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $notification->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification',
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
            $notification = Notification::find($id);

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(string $id)
    {
        try {
            $notification = Notification::find($id);

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->update(['status' => 'Read']);

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification marked as read successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(Request $request, string $userId)
    {
        try {
            $query = Notification::with('client', 'user')->where('user_id', $userId);
            
            // Filter by status
            if ($request->has('status') && $request->get('status') !== 'All Status') {
                $query->where('status', $request->get('status'));
            }
            
            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }
            
            $notifications = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'message' => 'User notifications retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send notification
     */
    public function sendNotification(Request $request, string $id)
    {
        try {
            $notification = Notification::find($id);

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            // Here you would implement the actual notification sending logic
            // based on the method (Email, SMS, Push, etc.)
            
            $notification->update([
                'status' => 'Sent',
                'sent_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification sent successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
