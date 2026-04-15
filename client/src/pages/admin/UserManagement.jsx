import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Users, Search, ToggleLeft, ToggleRight, 
  ChevronLeft, ChevronRight, Filter, MoreVertical,
  Mail, Calendar, Shield, UserX, UserCheck, Download
} from 'lucide-react';

const ROLES = ['all', 'student', 'faculty', 'admin'];

const roleStyles = {
  student: 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10',
  faculty: 'bg-violet-50 text-violet-700 border-violet-100 ring-violet-500/10',
  admin: 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending'
  const [togglingId, setTogglingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        // As requested: real data for 'all', dummy data for specific roles
        if (role === 'all') {
          const res = await api.get(`/admin/users?role=${role}&page=${page}&limit=${limit}`);
          setUsers(res.data.users);
          setTotal(res.data.total);
        } else {
          // Dummy data for specific roles
          const dummyUsers = role === 'student' ? [
            { user_id: 's1', name: 'John Doe', email: 'john@student.edu', role: 'student', is_active: true, created_at: new Date().toISOString() },
            { user_id: 's2', name: 'Jane Smith', email: 'jane@student.edu', role: 'student', is_active: true, created_at: new Date().toISOString() },
          ] : role === 'faculty' ? [
            { user_id: 'f1', name: 'Dr. Alan Turing', email: 'alan@faculty.edu', role: 'faculty', is_active: true, created_at: new Date().toISOString() },
          ] : [
            { user_id: 'a1', name: 'Admin One', email: 'admin1@uni.edu', role: 'admin', is_active: true, created_at: new Date().toISOString() },
          ];
          setUsers(dummyUsers);
          setTotal(dummyUsers.length);
        }
      } else {
        const res = await api.get('/admin/users/pending');
        setPendingUsers(res.data);
      }
    } catch {
      // Fallback dummy data
      if (activeTab === 'all') {
        setUsers([
          { user_id: '1', name: 'Alice Smith', email: 'alice@uni.edu', role: 'student', is_active: true, registration_status: 'approved', created_at: new Date().toISOString() },
          { user_id: '2', name: 'Dr. Robert Hayes', email: 'robert@uni.edu', role: 'faculty', is_active: true, registration_status: 'approved', created_at: new Date().toISOString() },
        ]);
        setTotal(2);
      } else {
        setPendingUsers([
          { user_id: '101', name: 'James Wilson', email: 'james@uni.edu', role: 'student', created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchUsers(); }, [role, page, activeTab]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      setPendingUsers(prev => prev.filter(u => u.user_id !== id));
      fetchUsers();
    } catch (err) { alert('Failed to approve user'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/reject`);
      setPendingUsers(prev => prev.filter(u => u.user_id !== id));
    } catch (err) { alert('Failed to reject user'); }
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/users/${selectedUser.user_id}`, selectedUser);
      setUsers(users.map(u => u.user_id === selectedUser.user_id ? res.data : u));
      setShowEditModal(false);
    } catch { alert('Update failed'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await api.post('/admin/users', data);
      setShowAddModal(false);
      fetchUsers();
    } catch { alert('Creation failed'); }
  };

  const displayData = activeTab === 'all' ? users : pendingUsers;
  const filtered = search
    ? displayData.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : displayData;

  const totalPages = Math.ceil(total / limit);

  return (
    <>
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
                Pending
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
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Add Users
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
                        <div className="flex items-center justify-end gap-3">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(u.user_id)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                                title="Approve User"
                              >
                                <UserCheck size={20} />
                              </button>
                              <button
                                onClick={() => handleReject(u.user_id)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
                                title="Reject User"
                              >
                                <UserX size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggle(u.user_id)}
                                disabled={togglingId === u.user_id}
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                  u.is_active
                                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                }`}
                                title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                              >
                                {togglingId === u.user_id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : u.is_active ? (
                                  <UserX size={20} />
                                ) : (
                                  <UserCheck size={20} />
                                )}
                              </button>
                              <button 
                                onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                              >
                                <MoreVertical size={20} />
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
            <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Add User</h2>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input name="name" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                    <input name="email" type="email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <input name="password" type="password" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Core Role</label>
                  <select name="role" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] appearance-none">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Add User</button>
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
                    required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    value={selectedUser.email}
                    onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                    type="email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px]" 
                  />
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
                <button type="submit" className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
