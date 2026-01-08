<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    protected $reportService;
    
    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate overview report - matches /reports-overview
     */
    public function overview(Request $request)
    {
        try {
            $data = $this->reportService->getOverview($request);
            
            // Get revenue data for the overview
            $revenueData = $this->reportService->getRevenue($request);
            
            // Return data in exact format expected by frontend
            return response()->json([
                'totalRevenue' => $data['totalRevenue'] ?? 0,
                'totalClients' => $data['totalClients'] ?? 0,
                'activeSubscriptions' => $data['activeSubscriptions'] ?? 0,
                'avgRevenuePerClient' => $data['avgRevenuePerClient'] ?? 0,
                'subscriptionDistribution' => $data['subscriptionDistribution'] ?? [],
                // Include revenue data that overview tab expects
                'monthlyRevenueData' => $revenueData['monthlyRevenueData'] ?? [],
                'revenueByCurrency' => $revenueData['revenueByCurrency'] ?? []
            ]);
            
        } catch (\Exception $e) {
            Log::error('Overview report error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error generating overview report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate revenue report - matches /reports-revenue
     */
    public function revenue(Request $request)
    {
        try {
            $data = $this->reportService->getRevenue($request);
            
            return response()->json($data);
            
        } catch (\Exception $e) {
            Log::error('Revenue report error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error generating revenue report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate client report - matches /reports-client
     */
    public function clientReport(Request $request)
    {
        try {
            $clients = $this->reportService->getClientReport($request);
            
            return response()->json($clients);
            
        } catch (\Exception $e) {
            Log::error('Client report error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error generating client report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate subscription report - matches /reports-subscription
     */
    public function subscriptionReport(Request $request)
    {
        try {
            $data = $this->reportService->getSubscriptionReport($request);
            
            return response()->json($data);
            
        } catch (\Exception $e) {
            Log::error('Subscription report error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error generating subscription report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate a new report - matches /reports-generate
     */
    public function generateReport(Request $request)
    {
        try {
            $type = $request->input('type', 'overview');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $currency = $request->input('currency');
            
            // Create filtered request for the service
            $filteredRequest = new Request([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'currency' => $currency
            ]);
            
            $reportData = null;
            
            switch ($type) {
                case 'overview':
                    $reportData = $this->reportService->getOverview($filteredRequest);
                    break;
                case 'revenue':
                    $reportData = $this->reportService->getRevenue($filteredRequest);
                    break;
                case 'client':
                    $reportData = $this->reportService->getClientReport($filteredRequest);
                    break;
                case 'subscription':
                    $reportData = $this->reportService->getSubscriptionReport($filteredRequest);
                    break;
                default:
                    return response()->json([
                        'error' => 'Invalid report type',
                        'message' => 'The report type must be one of: overview, revenue, client, subscription'
                    ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Report generated successfully',
                'data' => $reportData
            ]);
            
        } catch (\Exception $e) {
            Log::error('Report generation error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error generating report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}