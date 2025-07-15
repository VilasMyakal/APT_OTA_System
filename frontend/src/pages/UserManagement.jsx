import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  User,
  Shield,
  Mail,
  Calendar
} from 'lucide-react';
import { BACKEND_BASE_URL } from '../utils/api';

const API = `${BACKEND_BASE_URL}/users`;
const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [addUserData, setAddUserData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUserList(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUserData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Add user failed');
      setAddModalOpen(false);
      setAddUserData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser({ ...user, password: '' }); // Always blank password for editing
    setEditModalOpen(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Only include password if not empty
      const updateData = { ...editingUser };
      if (!updateData.password) {
        delete updateData.password;
      }
      const res = await fetch(`${API}/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Edit user failed');
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingUser(null);
  };

  // Delete user(s)
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    setError('');
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
    setLoading(false);
  };
  const handleDeleteSelected = async () => {
    if (!window.confirm('Delete selected users?')) return;
    setLoading(true);
    setError('');
    try {
      for (const id of selectedUsers) {
        await fetch(`${API}/${id}`, { method: 'DELETE' });
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete selected users');
    }
    setLoading(false);
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleClasses[role]}`}>
        <Shield className="h-3 w-3 mr-1" />
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status === 'active' ? '●' : '○'}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const filteredUsers = userList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Users ({filteredUsers.length})
            </h3>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUsers.length} selected
                </span>
                <button className="text-sm text-red-600 hover:text-red-500" onClick={handleDeleteSelected}>
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created Date</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{'●●●●●●'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleDeleteUser(user._id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 left-0 top-0 w-full h-full z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 w-full max-w-2xl relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              onClick={handleEditCancel}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit User</h2>
              <form onSubmit={handleEditSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingUser.name}
                      onChange={handleEditChange}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editingUser.email}
                      onChange={handleEditChange}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        name="password"
                        value={editingUser.password}
                        onChange={handleEditChange}
                        className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowEditPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showEditPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      name="role"
                      value={editingUser.role}
                      onChange={handleEditChange}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <button type="button" onClick={handleEditCancel} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold">Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {addModalOpen && (
        <div className="fixed inset-0 left-0 top-0 w-full h-full z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 w-full max-w-2xl relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              onClick={() => setAddModalOpen(false)}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add User</h2>
              <form onSubmit={handleAddUser} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={addUserData.name}
                      onChange={e => setAddUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={addUserData.email}
                      onChange={e => setAddUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showAddPassword ? 'text' : 'password'}
                        name="password"
                        value={addUserData.password}
                        onChange={e => setAddUserData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowAddPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showAddPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      name="role"
                      value={addUserData.role}
                      onChange={e => setAddUserData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <button type="button" onClick={() => setAddModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold">Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 