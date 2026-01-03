<?php

namespace App\Http\Controllers;

use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    private $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Display a listing of the invoices.
     */
    public function index(): JsonResponse
    {
        try {
            $invoices = $this->invoiceService->getAll();
            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'client_id' => 'required|exists:clients,id',
                'issue_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:issue_date',
                'items' => 'required|array',
                'items.*.name' => 'required|string',
                'items.*.quantity' => 'required|numeric|min:0.01',
                'items.*.unit_price' => 'required|numeric|min:0',
                'status' => 'in:Draft,Sent,Paid,Overdue,Cancelled',
                'payment_status' => 'in:Unpaid,Partially Paid,Paid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = $this->invoiceService->create($request->all());

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified invoice.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $invoice = $this->invoiceService->getById($id);

            if (!$invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'client_id' => 'sometimes|exists:clients,id',
                'issue_date' => 'sometimes|date',
                'due_date' => 'sometimes|date|after_or_equal:issue_date',
                'items' => 'sometimes|array',
                'items.*.name' => 'sometimes|required|string',
                'items.*.quantity' => 'sometimes|required|numeric|min:0.01',
                'items.*.unit_price' => 'sometimes|required|numeric|min:0',
                'status' => 'in:Draft,Sent,Paid,Overdue,Cancelled',
                'payment_status' => 'in:Unpaid,Partially Paid,Paid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = $this->invoiceService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->invoiceService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Invoice deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate invoice from subscription
     */
    public function generateFromSubscription(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'subscription_id' => 'required|exists:subscriptions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = $this->invoiceService->generateFromSubscription($request->subscription_id);

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice generated successfully from subscription'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate invoice from purchase
     */
    public function generateFromPurchase(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'purchase_id' => 'required|exists:purchases,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invoice = $this->invoiceService->generateFromPurchase($request->purchase_id);

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice generated successfully from purchase'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoices by client
     */
    public function getByClient(int $clientId): JsonResponse
    {
        try {
            $invoices = $this->invoiceService->getByClient($clientId);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoices by status
     */
    public function getByStatus(string $status): JsonResponse
    {
        try {
            $invoices = $this->invoiceService->getByStatus($status);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download invoice as PDF
     */
    public function downloadInvoice(int $id): \Symfony\Component\HttpFoundation\Response
    {
        try {
            $invoice = $this->invoiceService->getById($id);

            if (!$invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            // Create a simple HTML invoice template
            $html = $this->generateInvoiceHTML($invoice);

            // For now, return the HTML as a response
            // In a real implementation, you would use a PDF generator like DomPDF
            return response($html)
                ->header('Content-Type', 'text/html')
                ->header('Content-Disposition', 'attachment; filename="invoice_' . $invoice->invoice_number . '.html"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML for invoice
     */
    /**
     * Generate HTML for invoice
     */
    private function generateInvoiceHTML($invoice): string
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
        $issueDate = date('d M, Y', strtotime($invoice->issue_date));
        $dueDate = date('d M, Y', strtotime($invoice->due_date));
        
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice - ' . $invoice->invoice_number . '</title>
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
                    background-color: ' . ($invoice->status == 'Paid' ? '#dcfce7' : '#f1f5f9') . ';
                    color: ' . ($invoice->status == 'Paid' ? '#166534' : '#475569') . ';
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
                    padding: 12px 15px; /* Reduced vertical padding */
                    text-align: left;
                    border-top: 1px solid ' . $colors['border'] . ';
                    border-bottom: 1px solid ' . $colors['border'] . ';
                }
                
                .items-table td {
                    padding: 12px 15px; /* Reduced vertical padding */
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
                    margin-bottom: 8px; /* Reduced margin */
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
                
                .notes-section {
                    padding: 30px 40px;
                    border-top: 1px solid ' . $colors['border'] . ';
                }
                
                .notes-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: ' . $colors['text'] . ';
                }
                
                .notes-text {
                    font-size: 13px;
                    color: ' . $colors['text-light'] . ';
                    line-height: 1.6;
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
                        <h1>Nano InfoTech</h1>
                        <p>Tech Solutions & Management</p>
                    </div>
                    
                    <div class="invoice-title">
                        <h2>Invoice</h2>
                        <div class="invoice-meta">
                            <div class="meta-row">
                                <span class="meta-label">Invoice #:</span>
                                <span class="meta-value">' . $invoice->invoice_number . '</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Date:</span>
                                <span class="meta-value">' . $issueDate . '</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Due Date:</span>
                                <span class="meta-value">' . $dueDate . '</span>
                            </div>
                            <div class="status-badge">
                                ' . $invoice->status . '
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="addresses">
                    <div class="address-block">
                        <div class="address-title">From</div>
                        <div class="address-name">Nano InfoTech</div>
                        <div class="address-details">
                            Dhaka, Bangladesh<br>
                            Phone: +880 1234 567890<br>
                            Email: info@nanotech.com
                        </div>
                    </div>
                    
                    <div class="address-block" style="text-align: right;">
                        <div class="address-title" style="text-align: right;">Bill To</div>
                        <div class="address-name">' . $invoice->client_name . '</div>
                        <div class="address-details">
                            ' . ($invoice->client_address ? nl2br($invoice->client_address) . '<br>' : '') . '
                            ' . ($invoice->client_phone ? $invoice->client_phone . '<br>' : '') . '
                            ' . ($invoice->client_email ? $invoice->client_email : '') . '
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
        
        foreach ($invoice->items as $item) {
            $html .= '<tr>
                <td class="col-desc">
                    <div style="font-weight: 500;">' . ($item['name'] ?? 'Item') . '</div>
                    <div style="font-size: 12px; color: ' . $colors['text-light'] . ';">' . ($item['description'] ?? '') . '</div>
                </td>
                <td class="col-qty">' . ($item['quantity'] ?? 1) . '</td>
                <td class="col-price">৳' . number_format($item['unit_price'] ?? 0, 2) . '</td>
                <td class="col-total">৳' . number_format(($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0), 2) . '</td>
            </tr>';
        }
        
        $html .= '</tbody>
                </table>
                
                <div class="summary-section">
                    <div class="summary-table">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>৳' . number_format($invoice->sub_total, 2) . '</span>
                        </div>';
                        
        if ($invoice->tax_amount > 0) {
            $html .= '<div class="summary-row">
                <span>Tax:</span>
                <span>৳' . number_format($invoice->tax_amount, 2) . '</span>
            </div>';
        }
        
        if ($invoice->discount_amount > 0) {
            $html .= '<div class="summary-row">
                <span>Discount:</span>
                <span>- ৳' . number_format($invoice->discount_amount, 2) . '</span>
            </div>';
        }
                        
        $html .= '<div class="summary-row total">
                            <span>Total Due:</span>
                            <span>৳' . number_format($invoice->total_amount, 2) . '</span>
                        </div>';

        if ($invoice->paid_amount > 0) {
            $html .= '<div class="summary-row" style="margin-top: 8px; color: #166534; font-weight: 500;">
                <span>Paid:</span>
                <span>৳' . number_format($invoice->paid_amount, 2) . '</span>
            </div>
            <div class="summary-row" style="padding-top: 8px; border-top: 1px dashed #e2e8f0; font-weight: 600;">
                <span>Balance Due:</span>
                <span>৳' . number_format($invoice->balance_amount, 2) . '</span>
            </div>';
        }
                        
        $html .= '</div>
                </div>';
                
        if ($invoice->notes || $invoice->terms) {
            $html .= '<div class="notes-section">';
            
            if ($invoice->notes) {
                $html .= '<div class="notes-title">Notes</div>
                <div class="notes-text" style="margin-bottom: 20px;">' . nl2br($invoice->notes) . '</div>';
            }
            
            if ($invoice->terms) {
                $html .= '<div class="notes-title">Terms & Conditions</div>
                <div class="notes-text">' . nl2br($invoice->terms) . '</div>';
            }
            
            $html .= '</div>';
        }

        $html .= '<div class="footer">
                    Thank you for your business!
                </div>
            </div>
        </body>
        </html>';

        return $html;
    }
}