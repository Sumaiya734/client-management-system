import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const ClientForm = ({ 
  client = null, 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    company: client?.company || '',
    email: client?.email || '',
    phone: client?.phone || '',
    status: client?.status || 'Active',
    address: client?.address || '',
    notes: client?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? 'Edit Client' : 'Add New Client'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter full name"
            />
            
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={errors.company}
              placeholder="Enter company name"
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter email address"
            />
            
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="Enter phone number"
            />
            
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>
          
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter full address"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about the client..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
            >
              {client ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
