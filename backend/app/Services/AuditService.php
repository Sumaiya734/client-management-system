<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log an audit entry
     *
     * @param string $action
     * @param string $module
     * @param string|null $details
     * @param array|null $oldValues
     * @param array|null $newValues
     * @return AuditLog
     */
    public function log(string $action, string $module, ?string $details = null, ?array $oldValues = null, ?array $newValues = null): AuditLog
    {
        $user = Auth::user();
        
        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'module' => $module,
            'details' => $details,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'url' => Request::fullUrl(),
            'user_agent' => Request::userAgent(),
        ]);
    }
    
    /**
     * Log a user action
     *
     * @param string $action
     * @param string $module
     * @param string|null $details
     * @return AuditLog
     */
    public function logAction(string $action, string $module, ?string $details = null): AuditLog
    {
        return $this->log($action, $module, $details);
    }
    
    /**
     * Log a record creation
     *
     * @param string $module
     * @param string|null $details
     * @param array|null $newValues
     * @return AuditLog
     */
    public function logCreation(string $module, ?string $details = null, ?array $newValues = null): AuditLog
    {
        return $this->log('Created', $module, $details, null, $newValues);
    }
    
    /**
     * Log a record update
     *
     * @param string $module
     * @param string|null $details
     * @param array|null $oldValues
     * @param array|null $newValues
     * @return AuditLog
     */
    public function logUpdate(string $module, ?string $details = null, ?array $oldValues = null, ?array $newValues = null): AuditLog
    {
        return $this->log('Updated', $module, $details, $oldValues, $newValues);
    }
    
    /**
     * Log a record deletion
     *
     * @param string $module
     * @param string|null $details
     * @param array|null $oldValues
     * @return AuditLog
     */
    public function logDeletion(string $module, ?string $details = null, ?array $oldValues = null): AuditLog
    {
        return $this->log('Deleted', $module, $details, $oldValues, null);
    }
}