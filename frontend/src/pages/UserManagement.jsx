import React from 'react';

const UserManagement = () => {
  const users = [
    { name: 'John Admin', email: 'admin@company.com', role: 'Administrator', status: 'Active', lastLogin: '2025-01-20 10:30' },
    { name: 'Sarah Accountant', email: 'sarah@company.com', role: 'Accountant', status: 'Active', lastLogin: '2025-01-19 15:45' },
    { name: 'Mike Sales', email: 'mike@company.com', role: 'Sales', status: 'Active', lastLogin: '2025-01-18 09:15' },
    { name: 'Lisa Support', email: 'lisa@company.com', role: 'Support', status: 'Inactive', lastLogin: '2024-12-15 14:20' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">User & Role Management</h1>
      <p className="text-gray-600 mb-6">Manage users, roles, and permissions</p>

      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="border rounded-lg p-2 mr-2"
          />
          <select className="border rounded-lg p-2">
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Accountant</option>
            <option>Sales</option>
            <option>Support</option>
          </select>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">+ Add User</button>
      </div>

      <h3 className="text-lg font-medium mb-2">Users ({users.length})</h3>
      <p className="text-gray-600 mb-4">Manage user accounts and access</p>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Last Login</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">
                <span className={`inline-block px-2 py-1 text-white rounded-lg ${user.role === 'Administrator' ? 'bg-red-500' : 'bg-gray-500'}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{user.status}</td>
              <td className="py-2 px-4 border-b">{user.lastLogin}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-500 hover:underline">Edit</button>
                <button className="text-red-500 hover:underline ml-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
