<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Subscription;
use App\Models\Billing_management;
use App\Models\Payment_management;
use Illuminate\Http\Request;

class DashboardService
{
    /**
     * Get dashboard statistics and summary data.
     */
    public function getDashboardData()
    {
        // Get summary statistics
        $totalClients = Client::count();
        $activeSubscriptions = Subscription::count();
        $pendingPayments = Billing_management::where('payment_status', 'Unpaid')->count();
        $monthlyRevenue = Billing_management::where('status', 'Completed')->sum('total_amount');
        
        // Get recent data
        $recentClients = Client::orderBy('created_at', 'desc')->limit(5)->get();
        $recentPayments = Payment_management::with('client')->orderBy('created_at', 'desc')->limit(5)->get();
        $recentBills = Billing_management::with('client')->orderBy('created_at', 'desc')->limit(5)->get();
        
        // Get additional stats
        $paidBills = Billing_management::where('payment_status', 'Paid')->count();
        $totalBills = Billing_management::count();
        $paymentRate = $totalBills > 0 ? round(($paidBills / $totalBills) * 100, 2) : 0;
        
        return [
            'summary' => [
                'totalClients' => $totalClients,
                'activeSubscriptions' => $activeSubscriptions,
                'pendingPayments' => $pendingPayments,
                'monthlyRevenue' => $monthlyRevenue,
                'paymentRate' => $paymentRate . '%',
                'totalBills' => $totalBills
            ],
            'recent' => [
                'recentClients' => $recentClients,
                'recentPayments' => $recentPayments,
                'recentBills' => $recentBills
            ]
        ];
    }

    /**
     * Get dashboard statistics with date range filter
     */
    public function getStats(Request $request)
    {
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
        
        return [
            'totalClients' => $totalClients,
            'activeSubscriptions' => $activeSubscriptions,
            'pendingPayments' => $pendingPayments,
            'monthlyRevenue' => $monthlyRevenue
        ];
    }
}