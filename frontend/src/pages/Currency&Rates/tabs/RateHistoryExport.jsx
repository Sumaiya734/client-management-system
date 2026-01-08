// src/pages/Currency/tabs/RateHistoryExport.js
import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/DropdownMenu';
import { useNotification } from '../../../components/Notifications';

const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = ['Date', 'Currency', 'Rate', 'Change', '% Change', 'Trend', 'Timestamp'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.date}"`,
      row.currency,
      row.rate,
      row.change,
      `${row.percentageChange}%`,
      row.trend,
      `"${row.timestamp}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const exportToJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const exportToPDF = async (data, currency, timeRange) => {
  // This is a simplified version. In production, use libraries like jsPDF or html2pdf
  const { showError } = useNotification();
  showError('PDF export requires additional setup');
};

export default function RateHistoryExport({ data, currency, timeRange }) {
  const { showSuccess, showError } = useNotification();
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      showError('No data to export');
      return;
    }

    try {
      setExporting(true);
      const filename = `rate-history-${currency}-${timeRange}-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          exportToCSV(data, `${filename}.csv`);
          showSuccess('Data exported as CSV');
          break;
        case 'json':
          exportToJSON(data, `${filename}.json`);
          showSuccess('Data exported as JSON');
          break;
        case 'pdf':
          await exportToPDF(data, currency, timeRange);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Export error:', err);
      showError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full" disabled={exporting || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}