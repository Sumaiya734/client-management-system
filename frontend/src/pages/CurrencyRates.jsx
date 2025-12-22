import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function CurrencyRates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const summaryStats = [
    {
      title: 'Active Currencies',
      value: '4',
      icon: DollarSign,
    },
    {
      title: 'Last Update',
      value: 'Today',
      icon: Clock,
    },
    {
      title: 'Average Change',
      value: '+1.5%',
      icon: TrendingUp,
    },
  ];

  const exchangeRates = [
    {
      id: 1,
      currencyPair: 'EUR / USD',
      rate: '0.8580',
      lastUpdated: '2025-01-20',
      change: '+0.0200 (+2.4%)',
      trend: 'up',
    },
    {
      id: 2,
      currencyPair: 'GBP / USD',
      rate: '0.7500',
      lastUpdated: '2025-01-20',
      change: '-0.0100 (-1.3%)',
      trend: 'down',
    },
    {
      id: 3,
      currencyPair: 'CAD / USD',
      rate: '1.3500',
      lastUpdated: '2025-01-20',
      change: '+0.0300 (+2.3%)',
      trend: 'up',
    },
    {
      id: 4,
      currencyPair: 'AUD / USD',
      rate: '1.4500',
      lastUpdated: '2025-01-20',
      change: '+0.0100 (+0.7%)',
      trend: 'up',
    },
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency & Exchange Rates"
        subtitle="Manage exchange rates and currency conversions"
        actions={
          <Button icon={<Plus className="h-4 w-4" />}>
            Set Rate
          </Button>
        }
      />

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search currencies..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Current Exchange Rates ({exchangeRates.length})</CardTitle>
          <CardDescription>All rates are relative to USD (Base: 1 USD)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.currencyPair}</TableCell>
                  <TableCell>{rate.rate}</TableCell>
                  <TableCell>{rate.lastUpdated}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${rate.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                      {rate.change}
                    </span>
                  </TableCell>
                  <TableCell>
                    {rate.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Edit rate"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Delete rate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
