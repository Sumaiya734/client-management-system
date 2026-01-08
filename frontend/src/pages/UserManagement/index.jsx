import React, { useState, useEffect } from 'react';
import { Shield, Clock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import ManagePermissionsModal from '../../components/userManagement/ManagePermissionsModal';
import EditUserModal from '../../components/userManagement/EditUserModal';
import { userManagementApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/Notifications';
import UsersTab from './tabs/UsersTab';
import RolesPermissionsTab from './tabs/RolesPermissionsTab';
import AuditLogTab from './tabs/AuditLogTab';

const UserManagement = () => {
  const { showError, showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState('Users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  
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
      let response;
      if (isAddMode) {
        // Create new user
        response = await userManagementApi.create(userData);
        setUsers([...users, response.data]);
        showSuccess('User created successfully');
      } else {
        // Update existing user
        response = await userManagementApi.update(selectedUser.id, userData);
        setUsers(users.map(user => user.id === selectedUser.id ? response.data : user));
        showSuccess('User updated successfully');
      }
      setIsEditUserModalOpen(false);
      return response.data; // Return the response data for the modal to use
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving the user';
      showError(errorMessage);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      isOpen: true,
      item: user,
      action: 'deleteUser'
    });
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    const user = confirmDialog.item;
    try {
      await userManagementApi.delete(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      showSuccess('User deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error deleting user: ' + (error.response?.data?.message || error.message));
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
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
        <UsersTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          users={users}
          loading={loading}
          filteredUsers={filteredUsers}
          getRoleBadgeColor={getRoleBadgeColor}
          getStatusBadgeVariant={getStatusBadgeVariant}
          roleOptions={roleOptions}
          setSelectedUser={setSelectedUser}
          setIsPermissionsModalOpen={setIsPermissionsModalOpen}
          setIsAddMode={setIsAddMode}
          setIsEditUserModalOpen={setIsEditUserModalOpen}
          handleDeleteUser={handleDeleteUser}
        />
      )}

      {/* Roles & Permissions Tab Content */}
      {activeTab === 'Roles & Permissions' && (
        <RolesPermissionsTab />
      )}

      {/* Audit Log Tab Content */}
      {activeTab === 'Audit Log' && (
        <AuditLogTab />
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
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user <strong>{confirmDialog.item?.name}</strong>? This action cannot be undone.
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
                onClick={confirmDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
