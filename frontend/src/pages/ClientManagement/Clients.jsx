import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import EditClientPopup from '../../components/CilentForm/EditClientPopup';
import api from '../../api';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Popup state management
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Fetch clients from API
  useEffect(() => {
    fetchClients();
  }, [statusFilter, searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      let url = '/clients';
      
      // Build query parameters
      const params = {};
      if (statusFilter !== 'All Status') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }
      
      const response = await api.get(url);
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create empty client template for adding new clients
  const createEmptyClient = () => ({
    id: null,
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
  const handleClientSubmit = async (clientData) => {
    try {
      if (isEditMode) {
        // Update existing client - ensure ID is properly formatted
        const clientId = clientData.id;
        if (!clientId) {
          alert('Client ID is required for update');
          return;
        }
        
        const response = await api.put(`/clients/${clientId}`, clientData);
        if (response.data.success) {
          // Update the client in the local state
          setClients(prev => prev.map(c => c.id === clientId ? response.data.data : c));
          alert('Client updated successfully');
        } else {
          alert('Failed to update client: ' + response.data.message);
        }
      } else {
        // Create new client
        const response = await api.post('/clients', clientData);
        if (response.data.success) {
          // Add the new client to the local state
          setClients(prev => [...prev, response.data.data]);
          alert('Client created successfully');
        } else {
          alert('Failed to create client: ' + response.data.message);
        }
      }
      
      handleClosePopup();
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error saving client:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        alert('Validation errors: ' + errorMessages.join(', '));
      } else {
        alert('Error saving client: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle client deletion
  const handleDeleteClient = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        const clientId = client.id;
        if (!clientId) {
          alert('Client ID is required for deletion');
          return;
        }
        
        const response = await api.delete(`/clients/${clientId}`);
        if (response.data.success) {
          // Remove the client from the local state
          setClients(prev => prev.filter(c => c.id !== clientId));
          alert('Client deleted successfully');
          fetchClients(); // Refresh the list
        } else {
          alert('Failed to delete client: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client: ' + error.response?.data?.message || error.message);
      }
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
          <CardTitle>Clients ({loading ? '...' : clients.length})</CardTitle>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : clients.length > 0 ? (
                clients.map((client) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
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
