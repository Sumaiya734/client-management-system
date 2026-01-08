import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';
import { userManagementApi } from '../../../api';

const RolesPermissionsTab = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Since there's no direct API for roles in the userManagementApi, 
        // we'll simulate with mock data fetched from a potential endpoint
        // In a real scenario, you would have a roles API endpoint
        const mockResponse = {
          data: [
            { 
              id: 1, 
              name: 'Administrator', 
              description: 'Full access to all modules and settings',
              permissions: ['All Permissions']
            },
            { 
              id: 2, 
              name: 'Accountant', 
              description: 'Access to financial data and reports',
              permissions: ['Payment Management', 'Reports & Analytics', 'Client Management', 'Currency Management']
            },
            { 
              id: 3, 
              name: 'Sales', 
              description: 'Client and product management',
              permissions: ['Client Management', 'Product Management', 'Purchase Orders', 'Reports & Analytics']
            },
            { 
              id: 4, 
              name: 'Support', 
              description: 'Customer support and notifications',
              permissions: ['Client Management', 'Notifications']
            }
          ]
        };
        setRoles(mockResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {loading ? (
        <div className="col-span-full text-center py-8">Loading roles...</div>
      ) : (
        roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>{role.name}</CardTitle>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, idx) => (
                    <span 
                      key={idx}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.name === 'Administrator' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default RolesPermissionsTab;