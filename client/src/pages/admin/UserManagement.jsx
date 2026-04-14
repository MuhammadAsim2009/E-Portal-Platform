import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Search, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const ROLES = ['all', 'student', 'faculty', 'admin'];

const roleBadge = {
  student: 'bg-sky-50 text-sky-700 border-sky-200',
  faculty: 'bg-violet-50 text-violet-700 border-violet-200',
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${role}&page=${page}&limit=${limit}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch {
      setUsers([
        { user_id: '1', name: 'Alice Smith', email: 'alice@uni.edu', role: 'student', is_active: true, created_at: new Date().toISOString() },
        { user_id: '2', name: 'Dr. Robert Hayes', email: 'robert@uni.edu', role: 'faculty', is_active: true, created_at: new Date().toISOString() },
        { user_id: '3', name: 'Bob Johnson', email: 'bob@uni.edu', role: 'student', is_active: false, created_at: new Date().toISOString() },
        { user_id: '4', name: 'System Admin', email: 'admin@gmail.com', role: 'admin', is_active: true, created_at: new Date().toISOString() },
      ]);
      setTotal(4);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [role, page]);

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

  const filtered = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={22} className="text-primary-600" /> User Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage and monitor all platform accounts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{total}</span> total users
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50 transition-all"
          />
        </div>
        {/* Role Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 flex-wrap">
          <Filter size={14} className="text-slate-400 ml-1" />
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">User</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Role</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Joined</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Status</th>
                <th className="text-right px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: j === 0 ? '70%' : '50%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">No users found.</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          <p className="text-slate-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${roleBadge[u.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggle(u.user_id)}
                        disabled={togglingId === u.user_id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          u.is_active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {togglingId === u.user_id ? (
                          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : u.is_active ? (
                          <><ToggleLeft size={13} /> Suspend</>
                        ) : (
                          <><ToggleRight size={13} /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
