import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Users, Search, ToggleLeft, ToggleRight, 
  ChevronLeft, ChevronRight, Filter, MoreVertical,
  Mail, Calendar, Shield, UserX, UserCheck, Download,
  Ban, Edit2, Trash2, Eye, EyeOff, ShieldAlert, FileUp, Info, HelpCircle,
  CheckCircle2, AlertCircle, X
} from 'lucide-react';
const ROLES = ['all', 'student', 'faculty', 'admin'];
const roleStyles = {
  student: 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10',
  faculty: 'bg-violet-50 text-violet-700 border-violet-100 ring-violet-500/10',
  admin: 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10',
};
const UserManagement = () => {
  usePageTitle('User Management');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState(null); // { title, message }
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [toastTimer, setToastTimer] = useState(null);
  const showToast = (type, msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ show: true, type, msg });
    const timer = setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
    setToastTimer(timer);
  };

  const limit = 10;
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const res = await api.get(`/admin/users?role=${role}&page=${page}&limit=${limit}`);
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      } else {
        const res = await api.get('/admin/users/pending');
        setPendingUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      if (activeTab === 'all') {
        setUsers([]);
        setTotal(0);
      } else {
        setPendingUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };
  // Always fetch pending count for badge
  useEffect(() => {
    api.get('/admin/users/pending').then(res => {
      setPendingUsers(res.data || []);
    }).catch(() => {});
  }, []);
  useEffect(() => { fetchUsers(); }, [role, page, activeTab]);
  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      const updated = pendingUsers.filter(u => u.user_id !== id);
      setPendingUsers(updated);
      fetchUsers();
    } catch (err) { console.error('Failed to approve user', err); }
  };
  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/reject`);
      const updated = pendingUsers.filter(u => u.user_id !== id);
      setPendingUsers(updated);
    } catch (err) { console.error('Failed to reject user', err); }
  };
  const handleToggle = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_active: res.data.is_active } : u));
    } catch {
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_active: !u.is_active } : u));
    } finally {
      setTogglingId(null);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.patch(`/admin/users/${selectedUser.user_id}`, selectedUser);
      setUsers(users.map(u => u.user_id === selectedUser.user_id ? { ...u, ...res.data } : u));
      setShowEditModal(false);
      fetchUsers(); // Refresh to be completely safe
      showToast('success', 'User updated successfully');
    } catch { showToast('error', 'Update failed'); } finally { setIsSubmitting(false); }
  };
  const handleDeleteUser = async () => {
    if (!userToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/users/${userToDelete.user_id}`);
      setUserToDelete(null);
      fetchUsers();
      showToast('success', 'User deleted successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user. Please try again.';
      setUserToDelete(null);
      setErrorModal({
        title: err.response?.status === 409 ? 'Cannot Delete Enrolled Student' : 'Deletion Failed',
        message: msg,
      });
    } finally { setIsSubmitting(false); }
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await api.post('/admin/users', data);
      setShowAddModal(false);
      fetchUsers();
      showToast('success', 'User created successfully');
    } catch { showToast('error', 'Creation failed'); } finally { setIsSubmitting(false); }
  };
  const handleBulkEnroll = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;
    setBulkProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        const usersToCreate = rows.filter(row => row.trim()).map(row => {
          const [name, email, role, password, department, registration_status] = row.split(',').map(s => s?.trim());
          return { name, email, role, password, department, is_admin_created: true };
        });
        if (usersToCreate.length === 0) {
          showToast('error', 'CSV file appears empty or malformed');
          return;
        }
        const res = await api.post('/admin/users/bulk', usersToCreate);
        showToast('success', res.data.message);
        setShowBulkModal(false);
        setBulkFile(null);
        fetchUsers();
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Batch enrollment failed');
      } finally {
        setBulkProcessing(false);
      }
    };
    reader.readAsText(bulkFile);
  };
  const displayData = activeTab === 'all' ? users : pendingUsers;
  const filtered = search
    ? displayData.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : displayData;
  const totalPages = Math.ceil(total / limit);
  return (
    <>
      {toast.show && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className={`flex items-center gap-4 pl-4 pr-3 py-3 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-emerald-500/95 border-emerald-400/50 text-white' 
              : 'bg-rose-500/95 border-rose-400/50 text-white'
          }`}>
            <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium opacity-80 uppercase tracking-wider mb-0.5">
                {toast.type === 'success' ? 'Success' : 'Attention Needed'}
              </p>
              <p className="text-sm font-semibold leading-tight">{toast.msg}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <X size={16} className="opacity-60 group-hover:opacity-100" />
            </button>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 rounded-full bg-white/30 animate-progress origin-left`} style={{ animationDuration: '5000ms' }}></div>
        </div>
      )}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all relative ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pending Approvals
                {pendingUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white border-2 border-white rounded-full text-[10px] flex items-center justify-center">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            </div>
            <p className="text-slate-500 font-medium max-w-md mt-4 text-sm">Coordinate and regulate access for the entire academic ecosystem.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileUp size={16} className="text-indigo-500" />
              Batch Enrollment
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Add User
            </button>
          </div>
        </div>
        {/* Control Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
          <div className="relative flex-1 w-full group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email or identification..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-[13px] font-medium transition-all focus:bg-white"
            />
          </div>
          <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-[12px] font-semibold capitalize whitespace-nowrap transition-all ${
                  role === r 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Membership</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-100 rounded-full w-1/4" />
                            <div className="h-3 bg-slate-50 rounded-full w-1/3" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                          <Users size={40} />
                        </div>
                        <p className="text-slate-900 font-bold brand-font">No Users Detected</p>
                        <p className="text-slate-400 text-sm">Refine your search or filter to find specific records.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.user_id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-bold text-xs group-hover:scale-105 transition-transform">
                            {u?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-[10px] font-medium">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${roleStyles[u.role] || 'bg-slate-50'}`}>
                          <Shield size={10} />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Joined Portal</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-rose-50 text-rose-700 ring-rose-100'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className="text-[11px] font-black uppercase tracking-wider">{u.is_active ? 'Verified' : 'Banned'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(u.user_id)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                                title="Approve User"
                              >
                                <UserCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(u.user_id)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
                                title="Reject User"
                              >
                                <UserX size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggle(u.user_id)}
                                disabled={togglingId === u.user_id}
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                  u.is_active
                                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                }`}
                                title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                              >
                                {togglingId === u.user_id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : u.is_active ? (
                                  <UserX size={18} />
                                ) : (
                                  <UserCheck size={18} />
                                )}
                              </button>
                              <button 
                                onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-all"
                                title="Edit User"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => setUserToDelete(u)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Footer Navigation */}
          <div className="px-10 py-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{filtered.length}</span> of {total} records
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages || 0)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl p-8 animate-in zoom-in-95 duration-300 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Add New User</h2>
            <p className="text-slate-400 text-[13px] font-medium mb-6">Provision a new account into the academic ecosystem.</p>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input name="name" required placeholder="Enter full name (e.g. John Doe)" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                    <input name="email" type="email" required placeholder="john.doe@university.edu" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input name="phone" type="tel" placeholder="+92 300 1234567" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Core Role</label>
                    <select name="role" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] appearance-none">
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="••••••••"
                        className="w-full px-5 py-3 pr-12 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setShowPassword(false); }} 
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all"
                >Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Provisioning...</> : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl p-8 animate-in zoom-in-95 duration-300 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Edit Profile</h2>
            <p className="text-slate-500 mb-6 font-medium text-[13px]">Modify existing metadata for the selected academic user.</p>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    value={selectedUser.name}
                    onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                    placeholder="Enter full name"
                    required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input 
                      value={selectedUser.email}
                      onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                      type="email" required placeholder="email@university.edu" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input 
                      value={selectedUser.phone || ''}
                      onChange={e => setSelectedUser({...selectedUser, phone: e.target.value})}
                      type="tel" placeholder="+92 3XX XXXXXXX" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Core Role</label>
                  <select 
                    value={selectedUser.role}
                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                    required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 relative z-10 border-4 border-rose-50">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 brand-font">Erase Identity?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
              You are about to permanently delete <span className="text-slate-900 font-bold">{userToDelete.name}</span>'s record from the academic ecosystem. This action is irreversible.
            </p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteUser}
                className="flex-[2] px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[14px] hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 active:scale-[0.98] transition-all"
              >
                Yes, Erase
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Error / Blocked-Action Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-amber-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100 relative z-10 border-4 border-amber-50">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">{errorModal.title}</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[300px] mx-auto">
              {errorModal.message}
            </p>
            <button
              type="button"
              onClick={() => setErrorModal(null)}
              className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[14px] hover:bg-slate-800 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* Bulk Enrollment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-xl p-10 animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                <FileUp size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Batch Enrollment</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Seamlessly provision multiple accounts via CSV</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 border-dashed">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Info size={18} className="text-slate-400" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">CSV Standard Pattern</p>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed font-mono">
                    name, email, role, password, department
                  </p>
                  <button 
                    onClick={() => {
                      const headers = 'name,email,role,password,department\nJohn Doe,john@example.com,student,pass123,BSCS\nJane Doe,jane@example.com,faculty,pass456,IT';
                      const blob = new Blob([headers], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.setAttribute('hidden', '');
                      a.setAttribute('href', url);
                      a.setAttribute('download', 'user_enrollment_template.csv');
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:text-indigo-700 transition-colors flex items-center gap-1"
                  >
                    Download Template Schema
                    <Download size={10} />
                  </button>
                </div>
              </div>
            </div>
            <form onSubmit={handleBulkEnroll} className="space-y-6">
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${
                  bulkFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }`}
                onClick={() => document.getElementById('bulk-csv-input').click()}
              >
                <input 
                  id="bulk-csv-input"
                  type="file" 
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                  bulkFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:text-indigo-500'
                }`}>
                  <FileUp size={24} />
                </div>
                {bulkFile ? (
                  <div className="text-center">
                    <p className="text-[14px] font-black text-slate-900">{bulkFile.name}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Ready for ingestion</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[14px] font-black text-slate-900">Choose CSV File</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">or drop it here</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowBulkModal(false); setBulkFile(null); }} 
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!bulkFile || bulkProcessing}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {bulkProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingesting...
                    </div>
                  ) : 'Start Ingestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default UserManagement;
