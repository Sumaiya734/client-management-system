<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Subscription;
use App\Models\Billing_management;
use App\Models\Payment_management;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardService
{
    protected $subscriptionService;
    
    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }
    
    /**
     * Get dashboard statistics and summary data.
     */
    public function getDashboardData()
    {
        // Calculate date ranges for current and previous month
        $currentMonthStart = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();
        $previousMonthStart = now()->subMonth()->startOfMonth();
        $previousMonthEnd = now()->subMonth()->endOfMonth();
        
        // Get summary statistics for current period
        $totalClients = Client::count();
        $totalVendors = Vendor::count();
        $totalProducts = Product::count();
        $totalPurchases = Purchase::count();
        $activeSubscriptions = Subscription::count();
        $pendingPayments = Billing_management::where('payment_status', 'Unpaid')->count();
        $monthlyRevenue = Billing_management::where('status', 'Completed')->sum('total_amount');
        
        // Get summary statistics for previous month to calculate changes
        $prevTotalClients = Client::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevTotalVendors = Vendor::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevTotalProducts = Product::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevTotalPurchases = Purchase::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevActiveSubscriptions = Subscription::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevPendingPayments = Billing_management::where('payment_status', 'Unpaid')->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $prevMonthlyRevenue = Billing_management::where('status', 'Completed')->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->sum('total_amount');
        
        // Calculate changes and trends
        $totalClientsChange = $this->calculatePercentageChange($prevTotalClients, $totalClients);
        $totalVendorsChange = $this->calculatePercentageChange($prevTotalVendors, $totalVendors);
        $totalProductsChange = $this->calculatePercentageChange($prevTotalProducts, $totalProducts);
        $totalPurchasesChange = $this->calculatePercentageChange($prevTotalPurchases, $totalPurchases);
        $activeSubscriptionsChange = $this->calculatePercentageChange($prevActiveSubscriptions, $activeSubscriptions);
        $pendingPaymentsChange = $this->calculatePercentageChange($prevPendingPayments, $pendingPayments);
        $monthlyRevenueChange = $this->calculatePercentageChange($prevMonthlyRevenue, $monthlyRevenue);
        
        $totalClientsTrend = $this->getTrend($prevTotalClients, $totalClients);
        $totalVendorsTrend = $this->getTrend($prevTotalVendors, $totalVendors);
        $totalProductsTrend = $this->getTrend($prevTotalProducts, $totalProducts);
        $totalPurchasesTrend = $this->getTrend($prevTotalPurchases, $totalPurchases);
        $activeSubscriptionsTrend = $this->getTrend($prevActiveSubscriptions, $activeSubscriptions);
        $pendingPaymentsTrend = $this->getTrend($prevPendingPayments, $pendingPayments);
        $monthlyRevenueTrend = $this->getTrend($prevMonthlyRevenue, $monthlyRevenue);
        
        // Get recent data
        $recentClients = Client::orderBy('created_at', 'desc')->limit(5)->get();
        $recentPayments = Payment_management::with('client')->orderBy('created_at', 'desc')->limit(5)->get();
        $recentBills = Billing_management::with('client')->orderBy('created_at', 'desc')->limit(5)->get();
        
        // Get additional stats
        $paidBills = Billing_management::where('payment_status', 'Paid')->count();
        $totalBills = Billing_management::count();
        $paymentRate = $totalBills > 0 ? round(($paidBills / $totalBills) * 100, 2) : 0;
        
        // Get expiring soon subscriptions
        $expiringSoonSubscriptionsCollection = $this->subscriptionService->getRenewals();
        $expiringSoonSubscriptions = $expiringSoonSubscriptionsCollection->count();
        
        // Calculate changes and trends for expiring soon subscriptions
        $prevExpiringSoonSubscriptions = Subscription::whereBetween('end_date', [
            Carbon::now()->subMonth()->addDays(7)->startOfMonth(),
            Carbon::now()->subMonth()->addDays(7)->endOfMonth()
        ])->count();
        $expiringSoonSubscriptionsChange = $this->calculatePercentageChange($prevExpiringSoonSubscriptions, $expiringSoonSubscriptions);
        $expiringSoonSubscriptionsTrend = $this->getTrend($prevExpiringSoonSubscriptions, $expiringSoonSubscriptions);
        
        return [
            'summary' => [
                'totalClients' => $totalClients,
                'totalVendors' => $totalVendors,
                'totalProducts' => $totalProducts,
                'totalPurchases' => $totalPurchases,
                'activeSubscriptions' => $activeSubscriptions,
                'pendingPayments' => $pendingPayments,
                'monthlyRevenue' => $monthlyRevenue,
                'totalClientsChange' => $totalClientsChange,
                'totalVendorsChange' => $totalVendorsChange,
                'totalProductsChange' => $totalProductsChange,
                'totalPurchasesChange' => $totalPurchasesChange,
                'activeSubscriptionsChange' => $activeSubscriptionsChange,
                'pendingPaymentsChange' => $pendingPaymentsChange,
                'monthlyRevenueChange' => $monthlyRevenueChange,
                'totalClientsTrend' => $totalClientsTrend,
                'totalVendorsTrend' => $totalVendorsTrend,
                'totalProductsTrend' => $totalProductsTrend,
                'totalPurchasesTrend' => $totalPurchasesTrend,
                'activeSubscriptionsTrend' => $activeSubscriptionsTrend,
                'pendingPaymentsTrend' => $pendingPaymentsTrend,
                'monthlyRevenueTrend' => $monthlyRevenueTrend,
                'paymentRate' => $paymentRate . '%',
                'totalBills' => $totalBills,
                'expiringSoonSubscriptions' => $expiringSoonSubscriptions,
                'expiringSoonSubscriptionsChange' => $expiringSoonSubscriptionsChange,
                'expiringSoonSubscriptionsTrend' => $expiringSoonSubscriptionsTrend
            ],
            'recent' => [
                'recentClients' => $recentClients,
                'recentPayments' => $recentPayments,
                'recentBills' => $recentBills,
                'expiringSoonSubscriptions' => $expiringSoonSubscriptions
            ]
        ];
    }

    /**
     * Calculate percentage change between previous and current values
     */
    private function calculatePercentageChange($previousValue, $currentValue)
    {
        if ($previousValue == 0) {
            return $currentValue > 0 ? '+100%' : '0%';
        }
        
        $change = (($currentValue - $previousValue) / $previousValue) * 100;
        $sign = $change >= 0 ? '+' : '';
        
        return $sign . round($change, 1) . '%';
    }

    /**
     * Determine trend based on previous and current values
     */
    private function getTrend($previousValue, $currentValue)
    {
        if ($previousValue == 0) {
            return $currentValue > 0 ? 'up' : 'flat';
        }
        
        return $currentValue > $previousValue ? 'up' : ($currentValue < $previousValue ? 'down' : 'flat');
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