<?php

namespace App\Services;

use App\Models\Billing_management;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Product;
use App\Models\Currency_rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportService
{
    /**
     * Generate overview report
     */
    public function getOverview(Request $request = null)
    {
        try {
            $clientQuery = Client::query();
            $subscriptionQuery = Subscription::query();
            
            // Apply date range filter if provided
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                $currency = $request->input('currency');
                
                if ($startDate) {
                    $clientQuery->where('created_at', '>=', $startDate);
                    $subscriptionQuery->where(function($query) use ($startDate) {
                        $query->where('created_at', '>=', $startDate)
                              ->orWhere('start_date', '>=', $startDate);
                    });
                }
                
                if ($endDate) {
                    $clientQuery->where('created_at', '<=', $endDate);
                    $subscriptionQuery->where(function($query) use ($endDate) {
                        $query->where('created_at', '<=', $endDate)
                              ->orWhere('end_date', '<=', $endDate);
                    });
                }
                
                // Apply currency filter
                if ($currency && $currency !== 'All Currencies') {
                    $subscriptionQuery->whereHas('product', function($query) use ($currency) {
                        $query->where('base_currency', $currency);
                    });
                }
            }
            
            $totalClients = $clientQuery->count();
            $totalSubscriptions = $subscriptionQuery->count();
            $activeSubscriptions = $subscriptionQuery->where('status', 'active')->count();
            
            // Calculate total revenue from subscriptions
            $totalRevenue = $subscriptionQuery
                ->with('product')
                ->get()
                ->sum(function($subscription) {
                    // Use total_amount or custom_price
                    return $subscription->total_amount ?? $subscription->custom_price ?? 0;
                });
            
            // Calculate average revenue per client
            $avgRevenuePerClient = $totalClients > 0 ? $totalRevenue / $totalClients : 0;
            
            return [
                'totalClients' => $totalClients,
                'totalSubscriptions' => $totalSubscriptions,
                'activeSubscriptions' => $activeSubscriptions,
                'totalRevenue' => $totalRevenue,
                'avgRevenuePerClient' => $avgRevenuePerClient,
                'subscriptionDistribution' => $this->getSubscriptionDistribution($request)
            ];
            
        } catch (\Exception $e) {
            Log::error('getOverview error: ' . $e->getMessage());
            return [
                'totalClients' => 0,
                'totalSubscriptions' => 0,
                'activeSubscriptions' => 0,
                'totalRevenue' => 0,
                'avgRevenuePerClient' => 0,
                'subscriptionDistribution' => []
            ];
        }
    }
    
    /**
     * Generate revenue report
     */
    public function getRevenue(Request $request = null)
    {
        try {
            $query = DB::table('subscriptions')
                       ->join('products', 'subscriptions.product_id', '=', 'products.id');
            
            // Apply date range filter if provided
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                $currency = $request->input('currency');
                
                if ($startDate) {
                    $query->where(function($q) use ($startDate) {
                        $q->where('subscriptions.created_at', '>=', $startDate)
                          ->orWhere('subscriptions.start_date', '>=', $startDate);
                    });
                }
                
                if ($endDate) {
                    $query->where(function($q) use ($endDate) {
                        $q->where('subscriptions.created_at', '<=', $endDate)
                          ->orWhere('subscriptions.end_date', '<=', $endDate);
                    });
                }
                
                // Apply currency filter
                if ($currency && $currency !== 'All Currencies') {
                    $query->where('products.base_currency', $currency);
                }
            }
            
            // Get revenue by month
            $revenueByMonth = $query
                ->select(
                    DB::raw('MONTH(subscriptions.created_at) as month'),
                    DB::raw('YEAR(subscriptions.created_at) as year'),
                    DB::raw('SUM(COALESCE(subscriptions.total_amount, subscriptions.custom_price, 0)) as total_revenue'),
                    DB::raw('COUNT(*) as subscription_count')
                )
                ->whereNotNull('subscriptions.created_at')
                ->groupBy(DB::raw('YEAR(subscriptions.created_at)'), DB::raw('MONTH(subscriptions.created_at)'))
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(12) // Last 12 months
                ->get();
            
            // Process monthly revenue data for the frontend
            $monthNames = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
            ];
            
            $processedMonthlyRevenue = $revenueByMonth->map(function($item) use ($monthNames) {
                // Calculate new clients for this month
                $newClientsCount = Client::whereYear('created_at', $item->year)
                                       ->whereMonth('created_at', $item->month)
                                       ->count();
                
                return [
                    'month' => $monthNames[$item->month] ?? $item->month,
                    'revenue' => floatval($item->total_revenue),
                    'newClients' => $newClientsCount,
                    'growthRate' => null // Will be calculated in frontend
                ];
            })->values()->toArray();
            
            // If no data, return empty array (no fake data)
            if (empty($processedMonthlyRevenue)) {
                $processedMonthlyRevenue = [];
            }
            
            // Calculate revenue by currency
            $currencyQuery = DB::table('subscriptions')
                              ->join('products', 'subscriptions.product_id', '=', 'products.id')
                              ->select('products.base_currency as currency', DB::raw('SUM(COALESCE(subscriptions.total_amount, subscriptions.custom_price, 0)) as amount'))
                              ->groupBy('products.base_currency');
            
            // Apply same filters to currency query
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                $currency = $request->input('currency');
                
                if ($startDate) {
                    $currencyQuery->where(function($q) use ($startDate) {
                        $q->where('subscriptions.created_at', '>=', $startDate)
                          ->orWhere('subscriptions.start_date', '>=', $startDate);
                    });
                }
                
                if ($endDate) {
                    $currencyQuery->where(function($q) use ($endDate) {
                        $q->where('subscriptions.created_at', '<=', $endDate)
                          ->orWhere('subscriptions.end_date', '<=', $endDate);
                    });
                }
                
                if ($currency && $currency !== 'All Currencies') {
                    $currencyQuery->where('products.base_currency', $currency);
                }
            }
            
            $currencyData = $currencyQuery->get();
            $totalRevenue = $currencyData->sum('amount');
            
            $revenueByCurrency = $currencyData->map(function($item) use ($totalRevenue) {
                $percentage = $totalRevenue > 0 ? round(($item->amount / $totalRevenue) * 100, 1) : 0;
                return [
                    'currency' => $item->currency,
                    'percentage' => $percentage,
                    'amount' => floatval($item->amount)
                ];
            })->values()->toArray();
            
            // If no currency data, return empty array (no fake data)
            if (empty($revenueByCurrency)) {
                $revenueByCurrency = [];
            }
            
            return [
                'monthlyRevenueData' => $processedMonthlyRevenue,
                'revenueByCurrency' => $revenueByCurrency,
                'totalRevenue' => $totalRevenue
            ];
            
        } catch (\Exception $e) {
            Log::error('getRevenue error: ' . $e->getMessage());
            return [
                'monthlyRevenueData' => [],
                'revenueByCurrency' => [],
                'totalRevenue' => 0
            ];
        }
    }
    
    /**
     * Generate client report
     */
    public function getClientReport(Request $request = null)
    {
        try {
            $query = Client::query();
            
            // Apply date range filter if provided
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                
                if ($startDate) {
                    $query->where('created_at', '>=', $startDate);
                }
                
                if ($endDate) {
                    $query->where('created_at', '<=', $endDate);
                }
            }
            
            $clients = $query->get()->map(function($client) {
                // Get client's subscriptions
                $subscriptions = Subscription::where('client_id', $client->id)->get();
                $activeSubscriptions = $subscriptions->where('status', 'active')->count();
                $totalSubscriptions = $subscriptions->count();
                
                // Calculate total revenue from client's subscriptions
                $totalRevenue = $subscriptions->sum(function($subscription) {
                    return $subscription->total_amount ?? $subscription->custom_price ?? 0;
                });
                
                // Get last payment date
                $lastPayment = $subscriptions->sortByDesc('created_at')->first();
                $lastPaymentDate = $lastPayment ? $lastPayment->created_at->format('Y-m-d') : 'N/A';
                
                return [
                    'id' => $client->id,
                    'name' => $client->cli_name ?? $client->company ?? 'Unknown',
                    'company' => $client->company ?? 'N/A',
                    'totalSubscriptions' => $totalSubscriptions,
                    'activeSubscriptions' => $activeSubscriptions,
                    'totalRevenue' => floatval($totalRevenue),
                    'lastPayment' => $lastPaymentDate,
                    'status' => $activeSubscriptions > 0 ? 'Active' : 'Inactive'
                ];
            })->values()->toArray();
            
            return $clients;
            
        } catch (\Exception $e) {
            Log::error('getClientReport error: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Generate subscription report
     */
    public function getSubscriptionReport(Request $request = null)
    {
        try {
            $query = Subscription::query();
            
            // Apply date range filter if provided
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                
                if ($startDate) {
                    $query->where('created_at', '>=', $startDate);
                }
                
                if ($endDate) {
                    $query->where('created_at', '<=', $endDate);
                }
            }
            
            $subscriptions = $query->with(['product'])->get();
            
            // Group by product/plan
            $planSummary = [];
            foreach ($subscriptions->groupBy('product_id') as $productId => $productSubscriptions) {
                $product = $productSubscriptions->first()->product;
                $productName = $product ? $product->product_name : 'Unknown Product';
                
                $activeCount = $productSubscriptions->where('status', 'active')->count();
                $totalRevenue = $productSubscriptions->sum(function($sub) {
                    return $sub->total_amount ?? $sub->custom_price ?? 0;
                });
                
                $avgPerSubscription = $productSubscriptions->count() > 0 
                    ? $totalRevenue / $productSubscriptions->count() 
                    : 0;
                
                $planSummary[] = [
                    'planName' => $productName,
                    'activeSubscriptions' => $activeCount,
                    'monthlyRevenue' => floatval($totalRevenue),
                    'avgPerSubscription' => floatval($avgPerSubscription)
                ];
            }
            
            // If no plan summary, return empty array (no fake data)
            if (empty($planSummary)) {
                $planSummary = [];
            }
            
            // Get subscription trends (last 6 months)
            $trendQuery = DB::table('subscriptions')
                ->select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy('month')
                ->get();
            
            $trendData = [];
            $monthNames = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
            ];
            
            foreach ($trendQuery as $trend) {
                $trendData[] = [
                    'month' => $monthNames[$trend->month] ?? $trend->month,
                    'value' => intval($trend->count)
                ];
            }
            
            // If no trend data, return empty array (no fake data)
            if (empty($trendData)) {
                $trendData = [];
            }
            
            return [
                'planSummary' => $planSummary,
                'trendData' => $trendData
            ];
            
        } catch (\Exception $e) {
            Log::error('getSubscriptionReport error: ' . $e->getMessage());
            return [
                'planSummary' => [],
                'trendData' => []
            ];
        }
    }
    
    /**
     * Get subscription distribution by product/plan
     */
    private function getSubscriptionDistribution(Request $request = null)
    {
        try {
            $subscriptionQuery = Subscription::query();
            
            // Apply the same date range filter as in getOverview
            if ($request) {
                $startDate = $request->input('start_date');
                $endDate = $request->input('end_date');
                $currency = $request->input('currency');
                
                if ($startDate) {
                    $subscriptionQuery->where(function($query) use ($startDate) {
                        $query->where('created_at', '>=', $startDate)
                              ->orWhere('start_date', '>=', $startDate);
                    });
                }
                
                if ($endDate) {
                    $subscriptionQuery->where(function($query) use ($endDate) {
                        $query->where('created_at', '<=', $endDate)
                              ->orWhere('end_date', '<=', $endDate);
                    });
                }
            }
            
            $subscriptions = $subscriptionQuery->with('product')->get();
            $totalSubscriptions = $subscriptions->count();
            
            if ($totalSubscriptions === 0) {
                return [];
            }
            
            // Group by product name
            $grouped = [];
            foreach ($subscriptions as $subscription) {
                $productName = 'Unknown';
                
                if ($subscription->product && $subscription->product->product_name) {
                    $productName = $subscription->product->product_name;
                } elseif ($subscription->products_subscription_status) {
                    try {
                        $productData = json_decode($subscription->products_subscription_status, true);
                        if (is_array($productData) && count($productData) > 0) {
                            $productName = $productData[0]['product_name'] ?? $productData[0]['name'] ?? 'Unknown';
                        }
                    } catch (\Exception $e) {
                        // Ignore JSON decode errors
                    }
                }
                
                if (!isset($grouped[$productName])) {
                    $grouped[$productName] = 0;
                }
                $grouped[$productName]++;
            }
            
            // Format for frontend
            $distribution = [];
            foreach ($grouped as $name => $count) {
                $percentage = round(($count / $totalSubscriptions) * 100, 1);
                $distribution[] = [
                    'name' => $name,
                    'count' => $count,
                    'percentage' => $percentage
                ];
            }
            
            return $distribution;
            
        } catch (\Exception $e) {
            Log::error('getSubscriptionDistribution error: ' . $e->getMessage());
            return [];
        }
    }
}