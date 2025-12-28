<?php

namespace App\Services;

use App\Models\Billing_management;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Generate overview report
     */
    public function getOverview()
    {
        $totalClients = Client::count();
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        
        return [
            'totalClients' => $totalClients,
            'totalSubscriptions' => $totalSubscriptions,
            'activeSubscriptions' => $activeSubscriptions,
            'overview' => 'Overview data'
        ];
    }
    
    /**
     * Generate revenue report
     */
    public function getRevenue()
    {
        $revenueByMonth = DB::table('subscriptions')
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('COUNT(*) as subscription_count')
            )
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();
        
        return [
            'revenueByMonth' => $revenueByMonth,
            'totalRevenue' => $revenueByMonth->sum('total_revenue')
        ];
    }
    
    /**
     * Generate client report
     */
    public function getClientReport()
    {
        $clients = Client::with(['subscriptions' => function($query) {
            $query->where('status', 'active');
        }])
        ->get()
        ->map(function($client) {
            $activeSubscriptions = $client->subscriptions->count();
            $totalSubscriptions = $client->subscriptions()->count();
            $totalRevenue = $client->subscriptions->sum('total_amount');
            
            return [
                'id' => $client->id,
                'name' => $client->name,
                'company' => $client->company,
                'totalSubscriptions' => $totalSubscriptions,
                'activeSubscriptions' => $activeSubscriptions,
                'totalRevenue' => $totalRevenue,
                'lastPayment' => $client->subscriptions()->latest('created_at')->value('created_at'),
                'status' => $activeSubscriptions > 0 ? 'Active' : 'Inactive'
            ];
        });
        
        return $clients;
    }
    
    /**
     * Generate subscription report
     */
    public function getSubscriptionReport()
    {
        $subscriptions = Subscription::with(['client', 'product'])
            ->get();
        
        // Group by plan type
        $subscriptionsByPlan = $subscriptions->groupBy('product.name');
        
        $planSummary = [];
        foreach ($subscriptionsByPlan as $planName => $planSubscriptions) {
            $activeCount = $planSubscriptions->where('status', 'active')->count();
            $totalRevenue = $planSubscriptions->sum('total_amount');
            $avgPerSubscription = $planSubscriptions->count() > 0 
                ? $totalRevenue / $planSubscriptions->count() 
                : 0;
            
            $planSummary[] = [
                'planName' => $planName,
                'activeSubscriptions' => $activeCount,
                'monthlyRevenue' => $totalRevenue,
                'avgPerSubscription' => $avgPerSubscription
            ];
        }
        
        // Get subscription trends
        $subscriptionTrends = DB::table('subscriptions')
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->whereYear('created_at', date('Y'))
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();
        
        $trendData = [];
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
        ];
        
        foreach ($subscriptionTrends as $trend) {
            $trendData[] = [
                'month' => $monthNames[$trend->month],
                'value' => $trend->count
            ];
        }
        
        return [
            'planSummary' => $planSummary,
            'trendData' => $trendData
        ];
    }
    
    /**
     * Generate billing report
     */
    public function getBillingReport()
    {
        $bills = Billing_management::with(['client', 'subscription', 'purchase'])
            ->get();
        
        $totalBills = $bills->count();
        $paidBills = $bills->where('payment_status', 'Paid')->count();
        $unpaidBills = $bills->where('payment_status', 'Unpaid')->count();
        $partiallyPaidBills = $bills->where('payment_status', 'Partially Paid')->count();
        
        $totalRevenue = $bills->sum('total_amount');
        $amountCollected = $bills->sum('paid_amount');
        $outstandingAmount = $totalRevenue - $amountCollected;
        
        // Bills by status
        $billsByStatus = $bills->groupBy('payment_status')->map(function ($statusBills) {
            return [
                'count' => $statusBills->count(),
                'total_amount' => $statusBills->sum('total_amount'),
                'paid_amount' => $statusBills->sum('paid_amount')
            ];
        });
        
        // Bills by month
        $billsByMonth = $bills->groupBy(function ($bill) {
            return $bill->bill_date->format('Y-m');
        })->map(function ($monthlyBills) {
            return [
                'count' => $monthlyBills->count(),
                'total_amount' => $monthlyBills->sum('total_amount'),
                'paid_amount' => $monthlyBills->sum('paid_amount')
            ];
        });
        
        return [
            'totalBills' => $totalBills,
            'paidBills' => $paidBills,
            'unpaidBills' => $unpaidBills,
            'partiallyPaidBills' => $partiallyPaidBills,
            'totalRevenue' => $totalRevenue,
            'amountCollected' => $amountCollected,
            'outstandingAmount' => $outstandingAmount,
            'billsByStatus' => $billsByStatus,
            'billsByMonth' => $billsByMonth,
            'bills' => $bills
        ];
    }
    
    /**
     * Generate a report based on type
     */
    public function generateReport(Request $request)
    {
        $type = $request->input('type', 'overview');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        switch ($type) {
            case 'overview':
                return $this->getOverview();
            case 'revenue':
                return $this->getRevenue();
            case 'client':
                return $this->getClientReport();
            case 'subscription':
                return $this->getSubscriptionReport();
            case 'billing':
                return $this->getBillingReport();
            default:
                throw new \Exception('Invalid report type');
        }
    }
}