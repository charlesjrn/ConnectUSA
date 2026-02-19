import { useState } from 'react';
import { Users, Trash2, AlertTriangle, Edit } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function UserManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string | null; email: string | null } | null>(null);
  const [userToEdit, setUserToEdit] = useState<{ id: number; name: string; email: string; role: 'admin' | 'user' } | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' as 'admin' | 'user' });

  // Check if user is owner
  const { data: ownerCheck, isLoading: checkingOwner } = trpc.auth.isOwner.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: users = [], refetch, isLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: !!user && ownerCheck?.isOwner,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success('User updated successfully');
      setUserToEdit(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success('User deleted successfully');
      setUserToDelete(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const handleEditClick = (userId: number, userName: string, userEmail: string, userRole: 'admin' | 'user') => {
    setUserToEdit({ id: userId, name: userName, email: userEmail, role: userRole });
    setEditForm({ name: userName, email: userEmail, role: userRole });
  };

  const handleConfirmEdit = () => {
    if (userToEdit) {
      updateUserMutation.mutate({
        userId: userToEdit.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      });
    }
  };

  const handleDeleteClick = (userId: number, userName: string | null, userEmail: string | null) => {
    setUserToDelete({ id: userId, name: userName, email: userEmail });
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ userId: userToDelete.id });
    }
  };

  // Redirect if not owner
  if (!checkingOwner && !ownerCheck?.isOwner) {
    setLocation('/dashboard');
    toast.error('Access denied: Owner only');
    return null;
  }

  if (checkingOwner || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3E8] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">User Management</h1>
          <p className="text-gray-600">Manage community members (Owner Only)</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Warning</p>
              <p className="text-sm text-yellow-700">
                Deleting a user will permanently remove their account and all associated data (posts, comments, likes, messages). This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u: any) => {
                  const isCurrentUser = u.id === user?.id;
                  const isOwner = u.openId === process.env.OWNER_OPEN_ID;
                  
                  return (
                    <tr key={u.id} className={isCurrentUser ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {u.profilePicture ? (
                              <img
                                src={u.profilePicture}
                                alt={u.name || 'User'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold">
                                {u.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {isOwner ? 'Albert Rosebruch' : (u.name || 'Unknown')}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                              )}
                              {isOwner && (
                                <span className="ml-2 text-xs text-yellow-600 font-semibold">👑 Owner</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(u.id, u.name || '', u.email || '', u.role || 'user')}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {!isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(u.id, u.name, u.email)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>Total users: {users.length}</p>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          
          {userToEdit && (
            <div className="space-y-4 my-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToEdit(null)}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              disabled={updateUserMutation.isPending}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
              <p className="font-semibold text-gray-900">{userToDelete.name || 'Unknown User'}</p>
              <p className="text-sm text-gray-600">{userToDelete.email || 'No email'}</p>
              <p className="text-sm text-red-600 mt-2">
                All posts, comments, likes, and messages will be permanently deleted.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
