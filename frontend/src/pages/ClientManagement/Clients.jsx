import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import EditClientPopup from '../../components/CilentForm/EditClientPopup';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Popup state management
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const clients = [
    {
      id: 1,
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acmecorp.com',
      phone: '+1-234-567-8900',
      address: '123 Business St, New York, NY 10001',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Tech Solutions Inc',
      email: 'sarah@techsolutions.com',
      phone: '+1-234-567-8901',
      address: '456 Innovation Ave, San Francisco, CA 94105',
      status: 'Inactive'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      company: 'Global Dynamics',
      email: 'mike@globaldynamics.com',
      phone: '+1-234-567-8902',
      address: '789 Corporate Blvd, Chicago, IL 60601',
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

  // Create empty client template for adding new clients
  const createEmptyClient = () => ({
    id: Date.now().toString(), // Temporary ID for new clients
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  });

  // Handle opening popup for adding new client
  const handleAddClient = () => {
    setSelectedClient(createEmptyClient());
    setIsEditMode(false);
    setIsEditPopupOpen(true);
  };

  // Handle opening popup for editing existing client
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsEditMode(true);
    setIsEditPopupOpen(true);
  };

  // Handle closing popup
  const handleClosePopup = () => {
    setIsEditPopupOpen(false);
    setSelectedClient(null);
    setIsEditMode(false);
  };

  // Handle client update/create
  const handleClientSubmit = (clientData) => {
    if (isEditMode) {
      // Update existing client logic
      console.log('Updating client:', clientData);
      // TODO: Implement actual update logic (API call, state update, etc.)
    } else {
      // Create new client logic
      console.log('Creating new client:', clientData);
      // TODO: Implement actual create logic (API call, state update, etc.)
    }
    
    handleClosePopup();
  };

  // Handle client deletion
  const handleDeleteClient = (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      console.log('Deleting client:', client);
      // TODO: Implement actual delete logic
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Management"
        subtitle="Manage your client database"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleAddClient}
          >
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
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Delete client"
                        onClick={() => handleDeleteClient(client)}
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

      {/* Edit/Add Client Popup */}
      {selectedClient && (
        <EditClientPopup
          client={selectedClient}
          isOpen={isEditPopupOpen}
          onClose={handleClosePopup}
          onUpdate={handleClientSubmit}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
