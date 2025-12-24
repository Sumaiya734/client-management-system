<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Subscription;
use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Generate overview report
     */
    public function overview()
    {
        try {
            $totalClients = Client::count();
            $totalSubscriptions = Subscription::count();
            $activeSubscriptions = Subscription::where('status', 'active')->count();
            
            $data = [
                'totalClients' => $totalClients,
                'totalSubscriptions' => $totalSubscriptions,
                'activeSubscriptions' => $activeSubscriptions,
                'overview' => 'Overview data'
            ];
            
            return ResponseHelper::success($data, 'Overview report generated successfully');
        } catch (\Exception $e) {
            \Log::error('Overview report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating overview report', $e->getMessage());
        }
    }
    
    /**
     * Generate revenue report
     */
    public function revenue()
    {
        try {
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
            
            $data = [
                'revenueByMonth' => $revenueByMonth,
                'totalRevenue' => $revenueByMonth->sum('total_revenue')
            ];
            
            return ResponseHelper::success($data, 'Revenue report generated successfully');
        } catch (\Exception $e) {
            \Log::error('Revenue report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating revenue report', $e->getMessage());
        }
    }
    
    /**
     * Generate client report
     */
    public function clientReport()
    {
        try {
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
            
            return ResponseHelper::success($clients, 'Client report generated successfully');
        } catch (\Exception $e) {
            \Log::error('Client report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating client report', $e->getMessage());
        }
    }
    
    /**
     * Generate subscription report
     */
    public function subscriptionReport()
    {
        try {
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
            
            $data = [
                'planSummary' => $planSummary,
                'trendData' => $trendData
            ];
            
            return ResponseHelper::success($data, 'Subscription report generated successfully');
        } catch (\Exception $e) {
            \Log::error('Subscription report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating subscription report', $e->getMessage());
        }
    }
    
    /**
     * Generate a new report
     */
    public function generateReport(Request $request)
    {
        $type = $request->input('type', 'overview');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        switch ($type) {
            case 'overview':
                return $this->overview();
            case 'revenue':
                return $this->revenue();
            case 'client':
                return $this->clientReport();
            case 'subscription':
                return $this->subscriptionReport();
            default:
                return ResponseHelper::error('Invalid report type', null, 400);
        }
    }
}