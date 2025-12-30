import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Eye, Download, Send } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import BillDetailsPopup from '../../components/BillingManagement/BillDetailsPopup';
import { billingManagementApi } from '../../api';
import { formatDate } from '../../utils/dateUtils';

export default function BillingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  
  // Bill details popup state
  const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Billing data state
  const [bills, setBills] = useState([]);
  const [summaryStats, setSummaryStats] = useState([
    { title: 'Total Bills', value: '0', subtext: '0 paid, 0 unpaid', icon: FileText, color: 'blue' },
    { title: 'Total Revenue', value: '$0.00', subtext: 'All billed amounts', icon: DollarSign, color: 'green' },
    { title: 'Amount Collected', value: '$0.00', subtext: '0% of total revenue', icon: DollarSign, color: 'blue' },
    { title: 'Outstanding', value: '$0.00', subtext: 'Pending collection', icon: Calendar, color: 'orange' },
  ]);
  
  // Fetch billing data from API
  useEffect(() => {
    fetchBillingData();
  }, []);
  
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch bills
      const billsResponse = await billingManagementApi.getAll();
      // After response interceptor normalization, response.data is the array of bills
      setBills(billsResponse.data);
      
      // Fetch summary
      const summaryResponse = await billingManagementApi.summary();
      // After response interceptor normalization, response.data contains the summary
      const summary = summaryResponse.data;
      
      // Calculate percentage for amount collected
      const totalRevenue = parseFloat(summary.totalRevenue) || 0;
      const amountCollected = parseFloat(summary.amountCollected) || 0;
      const percentage = totalRevenue > 0 ? ((amountCollected / totalRevenue) * 100).toFixed(1) : '0';
      
      setSummaryStats([
        { 
          title: 'Total Bills', 
          value: summary.totalBills?.toString() || '0', 
          subtext: `${summary.paidBills || 0} paid, ${summary.unpaidBills || 0} unpaid`, 
          icon: FileText, 
          color: 'blue' 
        },
        { 
          title: 'Total Revenue', 
          value: `$${totalRevenue.toFixed(2)}`, 
          subtext: 'All billed amounts', 
          icon: DollarSign, 
          color: 'green' 
        },
        { 
          title: 'Amount Collected', 
          value: `$${amountCollected.toFixed(2)}`, 
          subtext: `${percentage}% of total revenue`, 
          icon: DollarSign, 
          color: 'blue' 
        },
        { 
          title: 'Outstanding', 
          value: `$${typeof summary.outstandingAmount === 'number' ? summary.outstandingAmount.toFixed(2) : parseFloat(summary.outstandingAmount)?.toFixed(2) || '0.00'}`, 
          subtext: 'Pending collection', 
          icon: Calendar, 
          color: 'orange' 
        },
      ]);
      
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Partially Paid', label: 'Partially Paid' },
    { value: 'Unpaid', label: 'Unpaid' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];
  
  // State for search
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Function to search bills
  const searchBills = async () => {
    if (!searchTerm && statusFilter === 'All Status') {
      // If no search term and default status, show all bills
      setSearchResults([]); // Reset search results to show all bills
      return;
    }
    
    try {
      setIsSearching(true);
      const searchParams = {
        search: searchTerm,
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
      };
      
      const response = await billingManagementApi.search(searchParams);
      // After response interceptor normalization, response.data is the array of search results
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching bills:', error);
      setSearchResults([]); // Reset to show all bills in case of error
    } finally {
      setIsSearching(false);
    }
  };
  
  // Refresh data when search or filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchBills();
    }, 300); // Debounce search
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);
  
  // Use search results if we have them, otherwise filter the bills
  const filteredBills = searchResults.length > 0 ? searchResults : (
    bills.filter(bill => {
      const matchesSearch = !searchTerm || 
        bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.client?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.po_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All Status' || bill.payment_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
  );

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    };
    return colors[color] || 'text-gray-600';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return 'bg-gray-900 text-white';
      case 'Partially Paid':
      case 'Pending':
        return 'bg-gray-200 text-gray-700';
      case 'Unpaid':
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle opening bill details popup
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsBillDetailsOpen(true);
  };
  
  // Handle updating a bill
  const handleUpdateBill = (updatedBill) => {
    // Update the bill in the local state
    setBills(prevBills => 
      prevBills.map(bill => 
        bill.id === updatedBill.id ? updatedBill : bill
      )
    );
    
    // Update the selected bill if it's the one being viewed
    if (selectedBill && selectedBill.id === updatedBill.id) {
      setSelectedBill(updatedBill);
    }
  };

  // Handle closing bill details popup
  const handleCloseBillDetails = () => {
    setIsBillDetailsOpen(false);
    setSelectedBill(null);
  };

  // Handle download bill
  const handleDownloadBill = (bill) => {
    // Extract bill number safely, handling both string and potential numeric formats
    const billNumber = bill.bill_number || bill.billNumber || bill.id || 'Unknown';
    console.log('Downloading bill:', billNumber);
    // TODO: Implement download logic
  };

  // Handle send email
  const handleSendEmail = (bill) => {
    // Extract bill number safely, handling both string and potential numeric formats
    const billNumber = bill.bill_number || bill.billNumber || bill.id || 'Unknown';
    console.log('Sending email for bill:', billNumber);
    // TODO: Implement email sending logic
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      const response = await billingManagementApi.generateReport({ type: 'billing' });
      console.log('Report generated:', response.data);
      
      // In a real implementation, you might want to show a modal with the report data
      // or download a PDF/Excel file
      alert('Billing report generated successfully! Check console for details.');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  // Handle export bills
  const handleExportBills = () => {
    // Export bills as CSV
    const headers = [
      'Bill Number',
      'Client',
      'PO Number',
      'Bill Date',
      'Due Date',
      'Total Amount',
      'Paid Amount',
      'Status',
      'Payment Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredBills.map(bill => [
        bill.bill_number || bill.billNumber || '',
        typeof bill.client === 'object' ? bill.client?.company || bill.client || '' : bill.client || '',
        bill.po_number || bill.poNumber || '',
        bill.bill_date || bill.billDate || '',
        bill.due_date || bill.dueDate || '',
        typeof bill.total_amount === 'number' ? bill.total_amount.toFixed(2) : parseFloat(bill.total_amount)?.toFixed(2) || '',
        typeof bill.paid_amount === 'number' ? bill.paid_amount.toFixed(2) : parseFloat(bill.paid_amount)?.toFixed(2) || '',
        bill.status || '',
        bill.payment_status || bill.paymentStatus || bill.status || ''
      ].map(field => `"${String(field).replace(/"/g, '')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `billing_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Management"
        subtitle="Generate and manage bills from purchase orders"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              icon={<Download className="h-4 w-4" />}
              onClick={handleExportBills}
            >
              Export Bills
            </Button>
            <Button 
              icon={<FileText className="h-4 w-4" />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className={`h-5 w-5 ${getIconColor(stat.color)}`} />
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by bill number, client, or PO..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bills ({filteredBills.length})</CardTitle>
          <CardDescription>All generated bills and payment status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => {
                // Format data for display
                const billNumber = bill.bill_number || bill.billNumber || 'N/A';
                const clientCompany = typeof bill.client === 'object' ? bill.client?.company || 'N/A' : bill.client || 'N/A';
                const clientContact = typeof bill.client === 'object' ? bill.client?.cli_name || bill.client?.contact || 'N/A' : 'N/A';
                const poNumber = bill.po_number || bill.poNumber || 'N/A';
                const billDate = formatDate(bill.bill_date || bill.billDate);
                const dueDate = formatDate(bill.due_date || bill.dueDate);
                const totalAmount = `$${typeof bill.total_amount === 'number' ? bill.total_amount.toFixed(2) : parseFloat(bill.total_amount)?.toFixed(2) || '0.00'}`;
                const paidAmount = `$${typeof bill.paid_amount === 'number' ? bill.paid_amount.toFixed(2) : parseFloat(bill.paid_amount)?.toFixed(2) || '0.00'}`;
                const status = bill.status || 'N/A';
                const paymentStatus = bill.payment_status || bill.paymentStatus || status;
                
                return (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="font-semibold text-gray-900">{billNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{clientCompany}</div>
                        <div className="text-sm text-gray-600">{clientContact}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{poNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{billDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{dueDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{totalAmount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{paidAmount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusBadgeColor(status)}`}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusBadgeColor(paymentStatus)}`}>
                        {paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="View bill"
                          onClick={() => handleViewBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Download bill"
                          onClick={() => handleDownloadBill(bill)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Send bill"
                          onClick={() => handleSendEmail(bill)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bill Details Popup */}
      <BillDetailsPopup
        bill={selectedBill}
        isOpen={isBillDetailsOpen}
        onClose={handleCloseBillDetails}
        onDownload={handleDownloadBill}
        onSendEmail={handleSendEmail}
        onUpdate={handleUpdateBill}
      />
    </div>
  );
}
