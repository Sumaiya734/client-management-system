<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Billing_management;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Report::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Reports are generated, not created manually.
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        return response()->json($report);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Reports are not updated manually.
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Reports are not deleted manually.
        return response()->json(['message' => 'Not implemented'], 501);
    }
    
    /**
     * Generate an overview report with key metrics
     */
    public function overview()
    {
        $totalRevenue = Billing_management::where('payment_status', 'paid')
            ->sum('total_amount');
        
        $totalClients = Client::count();
        
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        
        $avgRevenuePerClient = $totalClients > 0 
            ? $totalRevenue / $totalClients 
            : 0;
        
        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_clients' => $totalClients,
            'active_subscriptions' => $activeSubscriptions,
            'avg_revenue_per_client' => $avgRevenuePerClient
        ]);
    }
    
    /**
     * Generate revenue report with monthly breakdown
     */
    public function revenue()
    {
        // Get revenue by month for the current year
        $currentYear = date('Y');
        
        $monthlyRevenue = DB::table('billing_managements')
            ->select(
                DB::raw('MONTH(bill_date) as month'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as new_clients')
            )
            ->whereYear('bill_date', $currentYear)
            ->where('payment_status', 'paid')
            ->groupBy(DB::raw('MONTH(bill_date)'))
            ->orderBy('month')
            ->get();
        
        // Format month names
        $monthlyRevenueData = [];
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
        ];
        
        foreach ($monthlyRevenue as $item) {
            $monthlyRevenueData[] = [
                'month' => $monthNames[$item->month],
                'revenue' => (int)$item->revenue,
                'newClients' => (int)$item->new_clients,
                'growthRate' => null // We'll calculate this in frontend based on previous month
            ];
        }
        
        // Get revenue by currency
        $revenueByCurrency = DB::table('billing_managements')
            ->select(
                'currency',
                DB::raw('SUM(total_amount) as amount'),
                DB::raw('COUNT(*) as count')
            )
            ->where('payment_status', 'paid')
            ->groupBy('currency')
            ->get();
        
        $totalRevenue = $revenueByCurrency->sum('amount');
        $revenueByCurrency = $revenueByCurrency->map(function ($item) use ($totalRevenue) {
            $percentage = $totalRevenue > 0 ? round(($item->amount / $totalRevenue) * 100, 0) : 0;
            return [
                'currency' => $item->currency ?? 'USD',
                'percentage' => $percentage,
                'amount' => $item->amount
            ];
        });
        
        return response()->json([
            'monthlyRevenueData' => $monthlyRevenueData,
            'revenueByCurrency' => $revenueByCurrency->values()
        ]);
    }
    
    /**
     * Generate client report
     */
    public function clientReport()
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
        
        return response()->json($clients);
    }
    
    /**
     * Generate subscription report
     */
    public function subscriptionReport()
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
        
        return response()->json([
            'planSummary' => $planSummary,
            'trendData' => $trendData
        ]);
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
                return response()->json(['message' => 'Invalid report type'], 400);
        }
    }
}
