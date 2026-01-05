import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import EditVendorPopup from '../../components/VendorForm/EditVendorPopup';
import { vendorApi } from '../../api';
import { useNotification } from '../../components/Notifications/NotificationContext';

export default function VendorManagement() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });

  // Popup state management
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
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

  // Fetch vendors from API
  useEffect(() => {
    fetchVendors();
  }, [statusFilter, searchTerm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // Use search endpoint if we have search term or status filter
      if (searchTerm || (statusFilter && statusFilter !== 'All Status')) {
        const searchData = {};
        if (searchTerm) searchData.search = searchTerm;
        if (statusFilter && statusFilter !== 'All Status') searchData.status = statusFilter;
        
        const response = await vendorApi.search(searchData);
        setVendors(response.data);
      } else {
        // Use regular endpoint for all vendors
        const response = await vendorApi.getAll();
        setVendors(response.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
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

  // Create empty vendor template for adding new vendors
  const createEmptyVendor = () => ({
    id: null,
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    contact_person: '',
    status: 'Active'
  });

  // Handle opening popup for adding new vendor
  const handleAddVendor = () => {
    setSelectedVendor(createEmptyVendor());
    setIsEditMode(false);
    setIsEditPopupOpen(true);
  };

  // Handle opening popup for editing existing vendor
  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditMode(true);
    setIsEditPopupOpen(true);
  };

  // Handle closing popup
  const handleClosePopup = () => {
    setIsEditPopupOpen(false);
    setSelectedVendor(null);
    setIsEditMode(false);
  };

  // Handle vendor update/create
  const handleVendorSubmit = async (vendorData) => {
    try {
      if (isEditMode) {
        // Update existing vendor - ensure ID is properly formatted
        const vendorId = vendorData.id;
        if (!vendorId) {
          showError('Vendor ID is required for update');
          return;
        }
        
        const response = await vendorApi.update(vendorId, vendorData);
        // After response interceptor normalization, response.data contains the updated vendor
        // Update the vendor in the local state
        setVendors(prev => prev.map(v => v.id === vendorId ? response.data : v));
        showSuccess('Vendor updated successfully');
      } else {
        // Create new vendor
        const response = await vendorApi.create(vendorData);
        // After response interceptor normalization, response.data contains the created vendor
        // Add the new vendor to the local state
        setVendors(prev => [...prev, response.data]);
        showSuccess('Vendor created successfully');
      }
      
      handleClosePopup();
      fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error saving vendor:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showError('Validation errors: ' + errorMessages.join(', '));
      } else {
        showError('Error saving vendor: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle vendor deletion
  const handleDeleteVendor = (vendor) => {
    setConfirmDialog({
      isOpen: true,
      item: vendor,
      action: 'deleteVendor'
    });
  };

  // Confirm vendor deletion
  const confirmDeleteVendor = async () => {
    const vendor = confirmDialog.item;
    try {
      const vendorId = vendor.id;
      if (!vendorId) {
        showError('Vendor ID is required for deletion');
        return;
      }
      
      const response = await vendorApi.delete(vendorId);
      // After response interceptor normalization, response.data contains the result
      // Remove the vendor from the local state
      setVendors(prev => prev.filter(v => v.id !== vendorId));
      showSuccess('Vendor deleted successfully');
      fetchVendors(); // Refresh the list
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      showError('Error deleting vendor: ' + error.response?.data?.message || error.message);
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
        title="Vendor Management"
        subtitle="Manage your vendor database"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleAddVendor}
          >
            Add Vendor
          </Button>
        }
      />

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search vendors by name, company, or email..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendors ({loading ? '...' : vendors.length})</CardTitle>
          <CardDescription>Manage your vendor information</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8">
                    Loading vendors...
                  </TableCell>
                </TableRow>
              ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.company}</TableCell>
                    <TableCell>{vendor.contact_person}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'Active' ? 'active' : 'inactive'}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Edit vendor"
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Delete vendor"
                          onClick={() => handleDeleteVendor(vendor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8">
                    No vendors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Add Vendor Popup */}
      {selectedVendor && (
        <EditVendorPopup
          vendor={selectedVendor}
          isOpen={isEditPopupOpen}
          onClose={handleClosePopup}
          onUpdate={handleVendorSubmit}
          isEditMode={isEditMode}
        />
      )}
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{confirmDialog.item?.name}</strong>? This action cannot be undone.
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
                onClick={confirmDeleteVendor}
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