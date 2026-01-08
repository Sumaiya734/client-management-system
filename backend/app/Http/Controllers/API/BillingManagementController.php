<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BillingManagementService;
use Illuminate\Http\Request;

class BillingManagementController extends Controller
{
    protected $billingService;
    
    public function __construct(BillingManagementService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $billings = $this->billingService->getAll();
            
            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billing records retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $billing = $this->billingService->create($request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $billing = $this->billingService->getById($id);

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $billing = $this->billingService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record updated successfully'
            ]);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            if (strpos($e->getMessage(), 'Billing record not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $result = $this->billingService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Billing record deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Billing record not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search billing records with filters
     */
    public function search(Request $request)
    {
        try {
            $billings = $this->billingService->search($request);

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billing records retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search billing records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing summary statistics
     */
    public function summary()
    {
        try {
            $summary = $this->billingService->getSummary();

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Billing summary retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download the bill as HTML
     */
    public function download($id)
    {
        try {
            $billing = $this->billingService->getById($id);

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }

            // Generate HTML
            $html = $this->generateBillHTML($billing);

            return response($html)
                ->header('Content-Type', 'text/html')
                ->header('Content-Disposition', 'inline; filename="bill_' . $billing->bill_number . '.html"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download bill',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML for bill
     */
    private function generateBillHTML($billing): string
    {
        $colors = [
            'primary' => '#2563eb', // Blue
            'secondary' => '#64748b', // Slate
            'bg' => '#f8fafc',
            'border' => '#e2e8f0',
            'text' => '#1e293b',
            'text-light' => '#64748b',
        ];

        // Format dates
        $billDate = date('d M, Y', strtotime($billing->bill_date));
        $dueDate = date('d M, Y', strtotime($billing->due_date));
        
        // Client details
        $clientName = $billing->client->company ?? $billing->client->name ?? $billing->client;
        $clientAddress = $billing->client->address ?? 'N/A';
        $clientEmail = $billing->client->email ?? 'N/A';
        $clientPhone = $billing->client->phone ?? 'N/A';

        // Products
        $items = $billing->products ?? [];

        // Load logo from frontend assets if available, else fallback to public image
        $logoPath = realpath(base_path('../frontend/src/assets/nanosoft logo.png'));
        if ($logoPath && file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoMime = mime_content_type($logoPath) ?: 'image/png';
            $logoSrc = 'data:' . $logoMime . ';base64,' . $logoData;
        } else {
            $logoSrc = '/images/nanosoft-logo.png';
        }

        $html = '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Bill - ' . $billing->bill_number . '</title>
            <style>
                @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
                
                body {
                    font-family: "Inter", Helvetica, Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 40px 20px;
                    color: ' . $colors['text'] . ';
                    line-height: 1.5;
                    -webkit-font-smoothing: antialiased;
                }
                
                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                }
                
                .header-banner {
                    background-color: #ffffff;
                    padding: 40px 40px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid ' . $colors['primary'] . ';
                }
                
                .logo-area h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 800;
                    color: ' . $colors['primary'] . ';
                    letter-spacing: -0.5px;
                }
                
                .logo-area p {
                    margin: 5px 0 0;
                    font-size: 14px;
                    color: ' . $colors['text-light'] . ';
                }
                
                .invoice-title {
                    text-align: right;
                }
                
                .invoice-title h2 {
                    margin: 0;
                    font-size: 42px;
                    font-weight: 300;
                    color: ' . $colors['text-light'] . ';
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    opacity: 0.2;
                }
                
                .invoice-meta {
                    margin-top: 10px;
                    text-align: right;
                }
                
                .meta-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 4px;
                    font-size: 14px;
                }
                
                .meta-label {
                    color: ' . $colors['text-light'] . ';
                    font-weight: 500;
                    width: 100px;
                }
                
                .meta-value {
                    font-weight: 600;
                    min-width: 120px;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    background-color: ' . ($billing->status == 'Completed' || $billing->status == 'Paid' ? '#dcfce7' : '#f1f5f9') . ';
                    color: ' . ($billing->status == 'Completed' || $billing->status == 'Paid' ? '#166534' : '#475569') . ';
                    margin-top: 8px;
                }
                
                .addresses {
                    display: flex;
                    justify-content: space-between;
                    padding: 40px;
                    gap: 40px;
                }
                
                .address-block {
                    flex: 1;
                }
                
                .address-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: ' . $colors['text-light'] . ';
                    font-weight: 600;
                    margin-bottom: 12px;
                    border-bottom: 1px solid ' . $colors['border'] . ';
                    padding-bottom: 5px;
                }
                
                .address-name {
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 5px;
                    color: ' . $colors['text'] . ';
                }
                
                .address-details {
                    color: ' . $colors['text-light'] . ';
                    font-size: 14px;
                    line-height: 1.6;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0;
                }
                
                .items-table th {
                    background-color: #f8fafc;
                    color: ' . $colors['text-light'] . ';
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 12px 15px;
                    text-align: left;
                    border-top: 1px solid ' . $colors['border'] . ';
                    border-bottom: 1px solid ' . $colors['border'] . ';
                }
                
                .items-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid ' . $colors['border'] . ';
                    font-size: 14px;
                    color: ' . $colors['text'] . ';
                }
                
                .items-table tr:last-child td {
                    border-bottom: none;
                }
                
                .col-desc { width: 40%; }
                .col-qty { text-align: center; width: 15%; }
                .col-price { text-align: right; width: 20%; }
                .col-total { text-align: right; width: 25%; font-weight: 600; }
                
                .summary-section {
                    display: flex;
                    justify-content: flex-end;
                    padding: 30px 40px;
                    background-color: #f8fafc;
                }
                
                .summary-table {
                    width: 300px;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: ' . $colors['text-light'] . ';
                }
                
                .summary-row.total {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 2px solid ' . $colors['border'] . ';
                    font-size: 18px;
                    font-weight: 700;
                    color: ' . $colors['primary'] . ';
                }
                
                .footer {
                    background-color: ' . $colors['primary'] . ';
                    color: white;
                    padding: 20px 40px;
                    text-align: center;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                @media print {
                    body {
                        background-color: white;
                        padding: 0;
                    }
                    .invoice-container {
                        box-shadow: none;
                        max-width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header-banner">
                    <div class="logo-area">
                        <img src="' . $logoSrc . '"
                        alt="Nanosoft InfoTech"
                        style="height: 60px; display: block;">
                    </div>
                    
                    <div class="invoice-title">
                        <h2>Bill</h2>
                        <div class="invoice-meta">
                            <div class="meta-row">
                                <span class="meta-label">Bill #:</span>
                                <span class="meta-value">' . $billing->bill_number . '</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Date:</span>
                                <span class="meta-value">' . $billDate . '</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Due Date:</span>
                                <span class="meta-value">' . $dueDate . '</span>
                            </div>
                            <div class="status-badge">
                                ' . $billing->status . '
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="addresses">
                    <div class="address-block">
                        <div class="address-title">From</div>
                        <div class="address-name">Nanosoft InfoTech</div>
                        <div class="address-details">
                            Dhaka, Bangladesh<br>
                            Phone: +880 1234 567890<br>
                            Email: info@nanotech.com
                        </div>
                    </div>
                    
                    <div class="address-block" style="text-align: right;">
                        <div class="address-title" style="text-align: right;">Bill To</div>
                        <div class="address-name">' . $clientName . '</div>
                        <div class="address-details">
                            ' . ($clientAddress != 'N/A' && $clientAddress ? nl2br($clientAddress) . '<br>' : '') . '
                            ' . ($clientPhone != 'N/A' && $clientPhone ? $clientPhone . '<br>' : '') . '
                            ' . ($clientEmail != 'N/A' && $clientEmail ? $clientEmail : '') . '
                        </div>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="col-desc">Description</th>
                            <th class="col-qty">QTY</th>
                            <th class="col-price">Unit Price</th>
                            <th class="col-total">Amount</th>
                        </tr>
                    </thead>
                    <tbody>';
        
        if (count($items) > 0) {
            foreach ($items as $item) {
                $html .= '<tr>
                    <td class="col-desc">
                        <div style="font-weight: 500;">' . ($item['description'] ?? 'Item') . '</div>
                    </td>
                    <td class="col-qty">' . ($item['quantity'] ?? 1) . '</td>
                    <td class="col-price">৳' . number_format($item['unit_price'] ?? 0, 2) . '</td>
                    <td class="col-total">৳' . number_format($item['total'] ?? 0, 2) . '</td>
                </tr>';
            }
        } else {
             $html .= '<tr>
                    <td colspan="4" style="text-align: center;">No items found</td>
                </tr>';
        }
        
        $html .= '</tbody>
                </table>
                
                <div class="summary-section">
                    <div class="summary-table">
                        <div class="summary-row total">
                            <span>Total Due:</span>
                            <span>৳' . number_format($billing->total_amount, 2) . '</span>
                        </div>';

        if ($billing->paid_amount > 0) {
            $html .= '<div class="summary-row" style="margin-top: 8px; color: #166534; font-weight: 500;">
                <span>Paid:</span>
                <span>৳' . number_format($billing->paid_amount, 2) . '</span>
            </div>
            <div class="summary-row" style="padding-top: 8px; border-top: 1px dashed #e2e8f0; font-weight: 600;">
                <span>Balance Due:</span>
                <span>৳' . number_format(max(0, $billing->total_amount - $billing->paid_amount), 2) . '</span>
            </div>';
        }
                        
        $html .= '</div>
                </div>';
                
        $html .= '<div class="footer">
                    Thank you for your business!
                </div>
            </div>
        </body>
        </html>';

        return $html;
    }
}