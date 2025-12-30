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

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

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
      let url = '/vendors';
      
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
      
      const response = await vendorApi.getAll();
      // After response interceptor normalization, response.data is the array of vendors
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert('Error: ' + (error.response.data.message || 'API request failed') + ' (Status: ' + error.response.status + ')');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
        alert('Network error: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert('Error: ' + error.message);
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
          alert('Vendor ID is required for update');
          return;
        }
        
        const response = await vendorApi.update(vendorId, vendorData);
        // After response interceptor normalization, response.data contains the updated vendor
        // Update the vendor in the local state
        setVendors(prev => prev.map(v => v.id === vendorId ? response.data : v));
        alert('Vendor updated successfully');
      } else {
        // Create new vendor
        const response = await vendorApi.create(vendorData);
        // After response interceptor normalization, response.data contains the created vendor
        // Add the new vendor to the local state
        setVendors(prev => [...prev, response.data]);
        alert('Vendor created successfully');
      }
      
      handleClosePopup();
      fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error saving vendor:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        alert('Validation errors: ' + errorMessages.join(', '));
      } else {
        alert('Error saving vendor: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle vendor deletion
  const handleDeleteVendor = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      try {
        const vendorId = vendor.id;
        if (!vendorId) {
          alert('Vendor ID is required for deletion');
          return;
        }
        
        const response = await vendorApi.delete(vendorId);
        // After response interceptor normalization, response.data contains the result
        // Remove the vendor from the local state
        setVendors(prev => prev.filter(v => v.id !== vendorId));
        alert('Vendor deleted successfully');
        fetchVendors(); // Refresh the list
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor: ' + error.response?.data?.message || error.message);
      }
    }
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
    </div>
  );
}