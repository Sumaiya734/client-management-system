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
import { useNotification } from '../../components/Notifications';

export default function Clients() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  
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
      
      // Use search endpoint if we have search term or status filter
      if (searchTerm || (statusFilter && statusFilter !== 'All Status')) {
        const searchData = {};
        if (searchTerm) searchData.search = searchTerm;
        if (statusFilter && statusFilter !== 'All Status') searchData.status = statusFilter;
        
        const response = await api.post('/clients-search', searchData);
        setClients(response.data);
      } else {
        // Use regular endpoint for all clients
        const response = await api.get('/clients');
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        showError('Error: ' + (error.response.data.message || 'API request failed') + ' (Status: ' + error.response.status + ')');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
        showError('Network error: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        showError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create empty client template for adding new clients
  const createEmptyClient = () => ({
    id: null,
    cli_name: '',
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
          showError('Client ID is required for update');
          return;
        }
        
        const response = await api.put(`/clients/${clientId}`, clientData);
        // After response interceptor normalization, response.data contains the updated client
        // Update the client in the local state
        setClients(prev => prev.map(c => c.id === clientId ? response.data : c));
        showSuccess('Client updated successfully');
      } else {
        // Create new client
        const response = await api.post('/clients', clientData);
        // After response interceptor normalization, response.data contains the created client
        // Add the new client to the local state
        setClients(prev => [...prev, response.data]);
        showSuccess('Client created successfully');
      }
      
      handleClosePopup();
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error saving client:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showError('Validation errors: ' + errorMessages.join(', '));
      } else {
        showError('Error saving client: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle client deletion
  const handleDeleteClient = (client) => {
    setConfirmDialog({
      isOpen: true,
      item: client,
      action: 'deleteClient'
    });
  };

  // Confirm client deletion
  const confirmDeleteClient = async () => {
    const client = confirmDialog.item;
    try {
      const clientId = client.id;
      if (!clientId) {
        showError('Client ID is required for deletion');
        return;
      }
      
      const response = await api.delete(`/clients/${clientId}`);
      // After response interceptor normalization, response.data contains the result
      // Remove the client from the local state
      setClients(prev => prev.filter(c => c.id !== clientId));
      showSuccess('Client deleted successfully');
      fetchClients(); // Refresh the list
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      console.error('Error deleting client:', error);
      showError('Error deleting client: ' + error.response?.data?.message || error.message);
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
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
                    <TableCell>{client.cli_name}</TableCell>
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
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{confirmDialog.item?.cli_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmDeleteClient}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
