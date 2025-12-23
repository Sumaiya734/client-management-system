<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Billing_management;
use App\Models\Payment_management;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Display dashboard statistics and summary data.
     */
    public function index()
    {
        try {
            // Get summary statistics
            $totalClients = Client::count();
            $activeSubscriptions = Subscription::count();
            $pendingPayments = Billing_management::where('payment_status', 'Unpaid')->count();
            $monthlyRevenue = Billing_management::where('status', 'Completed')->sum('total_amount');
            
            // Get recent data
            $recentClients = Client::orderBy('created_at', 'desc')->limit(5)->get();
            $recentPayments = Payment_management::orderBy('created_at', 'desc')->limit(5)->get();
            $recentBills = Billing_management::orderBy('created_at', 'desc')->limit(5)->get();
            
            // Get additional stats
            $paidBills = Billing_management::where('payment_status', 'Paid')->count();
            $totalBills = Billing_management::count();
            $paymentRate = $totalBills > 0 ? round(($paidBills / $totalBills) * 100, 2) : 0;
            
            $dashboardData = [
                'summary' => [
                    'totalClients' => $totalClients,
                    'activeSubscriptions' => $activeSubscriptions,
                    'pendingPayments' => $pendingPayments,
                    'monthlyRevenue' => $monthlyRevenue,
                    'paymentRate' => $paymentRate . '%'
                ],
                'recent' => [
                    'recentClients' => $recentClients,
                    'recentPayments' => $recentPayments,
                    'recentBills' => $recentBills
                ]
            ];
            
            return response()->json([
                'success' => true,
                'data' => $dashboardData,
                'message' => 'Dashboard data retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Get dashboard statistics with date range filter
     */
    public function getStats(Request $request)
    {
        try {
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            $query = Client::query();
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate);
            }
            $totalClients = $query->count();
            
            $query = Subscription::query();
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate);
            }
            $activeSubscriptions = $query->count();
            
            $query = Billing_management::query();
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate);
            }
            $pendingPayments = $query->where('payment_status', 'Unpaid')->count();
            
            $query = Billing_management::query();
            if ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->where('created_at', '<=', $endDate);
            }
            $monthlyRevenue = $query->where('status', 'Completed')->sum('total_amount');
            
            $stats = [
                'totalClients' => $totalClients,
                'activeSubscriptions' => $activeSubscriptions,
                'pendingPayments' => $pendingPayments,
                'monthlyRevenue' => $monthlyRevenue
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
