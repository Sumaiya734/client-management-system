<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');
        
        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->filled('action')) {
            $query->where('action', 'LIKE', '%' . $request->action . '%');
        }
        
        if ($request->filled('module')) {
            $query->where('module', 'LIKE', '%' . $request->module . '%');
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('timestamp', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('timestamp', '<=', $request->date_to);
        }
        
        $auditLogs = $query->orderBy('timestamp', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $auditLogs
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $auditLog = AuditLog::create($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $auditLog
        ], 201);
    }
    
    /**
     * Display the specified resource.
     */
    public function show(AuditLog $auditLog): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $auditLog->load('user')
        ]);
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditLog $auditLog): JsonResponse
    {
        $auditLog->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Audit log deleted successfully.'
        ]);
    }
}
