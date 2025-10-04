import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import {
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserX,
  Eye,
  MoreVertical,
} from "lucide-react";

interface User {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: "customer" | "admin";
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // Sort by creation date (newest first)
      usersData.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phoneNumber && user.phoneNumber.includes(searchTerm))
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: any) => {
    try {
      if (!dateString) return "Invalid Date";

      // Handle Firestore timestamp format
      let date: Date;
      if (typeof dateString === "object" && dateString.toDate) {
        // Firestore Timestamp
        date = dateString.toDate();
      } else if (typeof dateString === "string") {
        // ISO string
        date = new Date(dateString);
      } else {
        return "Invalid Date";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, role: newRole as "customer" | "admin" }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdatingUser(null);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const isAdmin = role === "admin";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isAdmin
            ? "bg-purple-100 text-purple-800"
            : "bg-blue-100 text-blue-800"
        }`}>
        <Shield className="w-3 h-3 mr-1" />
        {isAdmin ? "Admin" : "Customer"}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-indigo-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-8 border border-slate-700/50 shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 lg:p-6 text-white shadow-2xl shadow-blue-500/25 border border-blue-500/20">
            <div className="flex items-center">
              <div className="bg-blue-500/30 p-2 lg:p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-blue-100 text-xs lg:text-sm font-medium">
                  Total Users
                </p>
                <p className="text-xl lg:text-2xl font-semibold text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-4 lg:p-6 text-white shadow-2xl shadow-purple-500/25 border border-purple-500/20">
            <div className="flex items-center">
              <div className="bg-purple-500/30 p-2 lg:p-3 rounded-xl backdrop-blur-sm">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-purple-100 text-xs lg:text-sm font-medium">
                  Admins
                </p>
                <p className="text-xl lg:text-2xl font-semibold text-white">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-4 lg:p-6 text-white shadow-2xl shadow-emerald-500/25 border border-emerald-500/20 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="bg-emerald-500/30 p-2 lg:p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-emerald-100 text-xs lg:text-sm font-medium">
                  Customers
                </p>
                <p className="text-xl lg:text-2xl font-semibold text-white">
                  {users.filter((u) => u.role === "customer").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm">
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="customer">Customers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {users.length === 0
                  ? "No users have registered yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.uid.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateUserRole(user.id, e.target.value)
                            }
                            disabled={updatingUser === user.id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500">
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="flex items-center">
                            <Eye className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center">
                            <UserX className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  {getRoleBadge(selectedUser.role)}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.email}
                    </p>
                  </div>

                  {selectedUser.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.phoneNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedUser.uid}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Joined
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowUserModal(false)}
                  variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Delete User
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{userToDelete.firstName}{" "}
                    {userToDelete.lastName}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={deleteUser}
                    disabled={deleting}
                    className="flex items-center">
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Deleting...</span>
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
