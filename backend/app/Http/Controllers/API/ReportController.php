<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportService;
    
    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate overview report
     */
    public function overview()
    {
        try {
            $data = $this->reportService->getOverview();
            
            return ResponseHelper::success($data, 'Overview report generated successfully');
        } catch (\Exception $e) {
            Log::error('Overview report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating overview report', $e->getMessage());
        }
    }
    
    /**
     * Generate revenue report
     */
    public function revenue()
    {
        try {
            $data = $this->reportService->getRevenue();
            
            return ResponseHelper::success($data, 'Revenue report generated successfully');
        } catch (\Exception $e) {
            Log::error('Revenue report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating revenue report', $e->getMessage());
        }
    }
    
    /**
     * Generate client report
     */
    public function clientReport()
    {
        try {
            $clients = $this->reportService->getClientReport();
            
            return ResponseHelper::success($clients, 'Client report generated successfully');
        } catch (\Exception $e) {
            Log::error('Client report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating client report', $e->getMessage());
        }
    }
    
    /**
     * Generate subscription report
     */
    public function subscriptionReport()
    {
        try {
            $data = $this->reportService->getSubscriptionReport();
            
            return ResponseHelper::success($data, 'Subscription report generated successfully');
        } catch (\Exception $e) {
            Log::error('Subscription report error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating subscription report', $e->getMessage());
        }
    }
    
    /**
     * Generate a new report
     */
    public function generateReport(Request $request)
    {
        try {
            $data = $this->reportService->generateReport($request);
            
            return ResponseHelper::success($data, 'Report generated successfully');
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Invalid report type') !== false) {
                return ResponseHelper::error('Invalid report type', null, 400);
            }
            
            Log::error('Report generation error: ' . $e->getMessage());
            return ResponseHelper::error('Error generating report', $e->getMessage());
        }
    }
}