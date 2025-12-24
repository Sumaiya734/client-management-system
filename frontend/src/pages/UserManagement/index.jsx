import React, { useState, useEffect } from 'react';
import { Search, Shield, Edit, Trash2, Clock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import ManagePermissionsModal from '../../components/userManagement/ManagePermissionsModal';
import EditUserModal from '../../components/userManagement/EditUserModal';
import { userManagementApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('Users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user: currentUser } = useAuth();

  const tabs = ['Users', 'Roles & Permissions', 'Audit Log'];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-500 text-white';
      case 'Accountant':
        return 'bg-gray-700 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'Active' ? 'active' : 'inactive';
  };

  const roleOptions = [
    { value: 'All Roles', label: 'All Roles' },
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Support', label: 'Support' },
  ];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userManagementApi.getAll();
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        // If it's a 401 error, it might be an authentication issue
        if (error.response?.status === 401) {
          // The axios interceptor should handle this, but we log it for debugging
          console.log('Authentication error when fetching users');
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSaveUser = async (userData) => {
    try {
      if (isAddMode) {
        // Create new user
        const response = await userManagementApi.create(userData);
        setUsers([...users, response.data]);
      } else {
        // Update existing user
        const response = await userManagementApi.update(selectedUser.id, userData);
        setUsers(users.map(user => user.id === selectedUser.id ? response.data : user));
      }
      setIsEditUserModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userManagementApi.delete(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdatePermissions = async (userId, permissionsData) => {
    try {
      await userManagementApi.updatePermissions(userId, permissionsData);
      setIsPermissionsModalOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User & Role Management"
        subtitle="Manage users, roles, and permissions"
        actions={
          <Button 
            variant="primary"
            onClick={() => {
              setSelectedUser(null);
              setIsAddMode(true);
              setIsEditUserModalOpen(true);
            }}
          >
            + Add User
          </Button>
        }
      />

      {/* Tab Navigation */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'Users' && (
        <>
          {/* Search & Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm min-w-[140px]"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts and access</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPermissionsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Permissions"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsAddMode(false);
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Roles & Permissions Tab Content */}
      {activeTab === 'Roles & Permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Administrator Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>Administrator</CardTitle>
              </div>
              <CardDescription>Full access to all modules and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                    All Permissions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accountant Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>Accountant</CardTitle>
              </div>
              <CardDescription>Access to financial data and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Payment Management
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Reports & Analytics
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Client Management
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Currency Management
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>Sales</CardTitle>
              </div>
              <CardDescription>Client and product management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Client Management
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Product Management
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Purchase Orders
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Reports & Analytics
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>Support</CardTitle>
              </div>
              <CardDescription>Customer support and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Client Management
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                    Notifications
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Log Tab Content */}
      {activeTab === 'Audit Log' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <CardTitle>Audit Log</CardTitle>
            </div>
            <CardDescription>Track user actions and system changes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Admin</TableCell>
                  <TableCell>Created new client</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Client Management
                    </span>
                  </TableCell>
                  <TableCell>Created client: Tech Solutions Inc</TableCell>
                  <TableCell>2025-01-20 10:45</TableCell>
                  <TableCell>192.168.1.100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sarah Accountant</TableCell>
                  <TableCell>Recorded payment</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Payment Management
                    </span>
                  </TableCell>
                  <TableCell>Payment of $99.99 for PO-2025-001</TableCell>
                  <TableCell>2025-01-20 09:30</TableCell>
                  <TableCell>192.168.1.101</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Mike Sales</TableCell>
                  <TableCell>Updated product pricing</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Product Management
                    </span>
                  </TableCell>
                  <TableCell>Updated Premium Plan pricing</TableCell>
                  <TableCell>2025-01-19 16:20</TableCell>
                  <TableCell>192.168.1.102</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Manage Permissions Modal */}
      <ManagePermissionsModal
        isOpen={isPermissionsModalOpen}
        onRequestClose={() => setIsPermissionsModalOpen(false)}
        user={selectedUser}
        onUpdate={(data) => {
          if (selectedUser) {
            handleUpdatePermissions(selectedUser.id, data);
          }
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onRequestClose={() => setIsEditUserModalOpen(false)}
        user={selectedUser}
        isAddMode={isAddMode}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagement;
