import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Eye, Trash2, X, FileText, Calendar, Mail, UserCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { formatDate, formatFileSize } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export const AdminUserManagement = () => {
  const { user: currentAdmin } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI features states
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Inspect detail modal state
  const [inspectUser, setInspectUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete modal confirmation state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      const errMsg = err.detail || err.message || 'Failed to load user records.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenInspect = async (userId) => {
    setDetailLoading(true);
    try {
      const data = await api.get(`/admin/users/${userId}`);
      setInspectUser(data);
    } catch (err) {
      addToast(err.message || 'Failed to load user detailed profiles.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteClick = (userToDelete, e) => {
    e.stopPropagation();
    if (userToDelete.id === currentAdmin?.id) {
      addToast('You are not allowed to delete your own administrative account.', 'error');
      return;
    }
    setDeleteConfirmUser(userToDelete);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteConfirmUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
      addToast(`User ${deleteConfirmUser.full_name || deleteConfirmUser.email} deleted successfully.`, 'success');
      
      // If inspecting this user, close inspect panel
      if (inspectUser?.id === deleteConfirmUser.id) {
        setInspectUser(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete user profile.', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirmUser(null);
    }
  };

  const handleViewPdf = async (resumeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${resumeId}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to retrieve PDF file.');
      }
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      addToast(err.message || 'Failed to open PDF file.', 'error');
    }
  };

  // Filter list
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = (u.full_name || '').toLowerCase().includes(term);
    const emailMatch = u.email.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  // Paginated list
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination on search change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingState text="Fetching system registered user indexes..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Header info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-brand-500" />
            User Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor, inspect, and delete system user profiles.
          </p>
        </div>
        
        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
          />
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 text-slate-400">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Failed to load records</h3>
          <p className="text-xs max-w-sm mx-auto mb-6">{error}</p>
          <Button variant="secondary" onClick={fetchUsers}>Retry Load</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main User Table Column */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border border-slate-900 p-0" bodyClassName="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                  <UserCheck className="w-10 h-10 text-slate-800 mb-2" />
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs text-slate-600 mt-1">Try modifying your search filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900/80 bg-slate-950/40 text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Avatar</th>
                        <th className="py-4 px-6">User details</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Joined date</th>
                        <th className="py-4 px-6 text-center">Resumes</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
                      {paginatedUsers.map((u) => (
                        <tr
                          key={u.id}
                          onClick={() => handleOpenInspect(u.id)}
                          className={`hover:bg-slate-900/20 transition-colors cursor-pointer ${
                            inspectUser?.id === u.id ? 'bg-slate-900/40' : ''
                          }`}
                        >
                          {/* Avatar */}
                          <td className="py-4 px-6">
                            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-brand-400 font-display">
                              {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                          </td>

                          {/* Details */}
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-200">{u.full_name || 'ResumeAI Member'}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{u.email}</div>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.role === 'admin' 
                                ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20' 
                                : 'text-slate-400 bg-slate-900 border border-slate-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-6 text-slate-400 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>

                          {/* Resumes count */}
                          <td className="py-4 px-6 text-center font-semibold text-slate-200">
                            {u.total_resumes_uploaded}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenInspect(u.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 border border-transparent transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={(e) => handleDeleteClick(u, e)}
                                disabled={u.id === currentAdmin?.id}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Delete account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-[10px] text-slate-500">
                  Showing page {currentPage} of {totalPages} ({filteredUsers.length} total users)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Inspect / Detailed Card Panel Column */}
          <div className="lg:col-span-4">
            {detailLoading ? (
              <Card title="Loading User Details" className="h-48 border border-slate-900">
                <LoadingState text="Loading profiles details..." />
              </Card>
            ) : inspectUser ? (
              <Card
                title={inspectUser.full_name || 'User Profile'}
                subtitle="Detailed administrative inspect data"
                actions={
                  <button
                    onClick={() => setInspectUser(null)}
                    className="p-1 text-slate-500 hover:text-slate-350"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                }
                className="border border-slate-800 animate-scale-in"
              >
                <div className="space-y-6">
                  {/* Account overview */}
                  <div className="flex items-center gap-3.5 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                    <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-accent-400">
                      {inspectUser.full_name ? inspectUser.full_name.charAt(0).toUpperCase() : inspectUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{inspectUser.full_name || 'Member Account'}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{inspectUser.email}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-semibold uppercase">Account Role</span>
                      <span className="text-slate-300 font-medium">{inspectUser.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-semibold uppercase">Registration Date</span>
                      <span className="text-slate-300 font-medium">{formatDate(inspectUser.created_at)}</span>
                    </div>
                  </div>

                  {/* Resumes list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Uploaded Documents ({inspectUser.resumes.length})
                    </h4>
                    
                    {inspectUser.resumes.length === 0 ? (
                      <p className="text-[10px] text-slate-600 bg-slate-950/40 p-3 rounded-lg text-center border border-slate-900">
                        This user has not uploaded any resumes.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {inspectUser.resumes.map((r) => (
                          <div key={r.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-[10px]">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-300 truncate">{r.filename}</p>
                              <p className="text-slate-500 text-[9px] mt-0.5">{formatFileSize(r.file_size)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-extrabold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                                {r.ats_score}% ATS
                              </span>
                              <button
                                onClick={() => handleViewPdf(r.id)}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-550 hover:text-slate-200 transition-colors"
                                title="View PDF"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] border border-slate-900 bg-slate-900/10 rounded-2xl flex items-center justify-center text-center p-6 text-slate-550">
                <div className="max-w-xs space-y-2">
                  <UserCheck className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-400">Select a User Account</p>
                  <p className="text-[10px] text-slate-600 leading-normal">
                    Click on a user record entry in the table to display full detailed lists of uploaded files and system parameters.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Reusable Custom Modal Confirmation Dialog */}
      {deleteConfirmUser && (
        <>
          {/* Overlay mask */}
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 transition-opacity"></div>
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-sm w-full border border-rose-500/25 p-6 space-y-6 shadow-2xl animate-scale-in">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-display">Confirm Deletion</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Are you sure you want to delete the account for{' '}
                    <strong className="text-slate-200">
                      {deleteConfirmUser.full_name || deleteConfirmUser.email}
                    </strong>
                    ? This operation is permanent and deletes all resumes, match history and coach sessions from storage.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => setDeleteConfirmUser(null)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  loading={deleting}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminUserManagement;
