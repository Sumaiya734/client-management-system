<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationService extends BaseService
{
    protected $model;

    public function __construct(Notification $model)
    {
        $this->model = $model;
    }

    /**
     * Get all notifications with relationships
     */
    public function getAll()
    {
        return $this->model->with('client', 'user')->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get notification by ID with relationships
     */
    public function getById($id)
    {
        return $this->model->with('client', 'user')->find($id);
    }

    /**
     * Create a new notification
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
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
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        return $this->model->create($data);
    }

    /**
     * Update an existing notification
     */
    public function update($id, array $data)
    {
        $notification = $this->model->find($id);

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        $validator = Validator::make($data, [
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
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        $notification->update($data);
        return $notification;
    }

    /**
     * Delete a notification
     */
    public function delete($id)
    {
        $notification = $this->model->find($id);

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        return $notification->delete();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = $this->model->find($id);

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        $notification->update(['status' => 'Read']);
        return $notification;
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications($userId, Request $request)
    {
        $query = $this->model->with('client', 'user')->where('user_id', $userId);
        
        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Send notification
     */
    public function sendNotification($id)
    {
        $notification = $this->model->find($id);

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        // Here you would implement the actual notification sending logic
        // based on the method (Email, SMS, Push, etc.)
        
        $notification->update([
            'status' => 'Sent',
            'sent_at' => now()
        ]);

        return $notification;
    }
}