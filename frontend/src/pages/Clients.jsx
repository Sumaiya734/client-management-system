import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const clients = [
    {
      id: 1,
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acmecorp.com',
      phone: '+1-234-567-8900',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Tech Solutions Inc',
      email: 'sarah@techsolutions.com',
      phone: '+1-234-567-8901',
      status: 'Inactive'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      company: 'Global Dynamics',
      email: 'mike@globaldynamics.com',
      phone: '+1-234-567-8902',
      status: 'Active'
    }
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
        title="Client Management"
        subtitle="Manage your client database"
        actions={
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Client
          </Button>
        }
      />

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search clients by name, company, or email..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Clients ({clients.length})</CardTitle>
          <CardDescription>Manage your client information</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Active' ? 'active' : 'inactive'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Edit client"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Delete client"
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
