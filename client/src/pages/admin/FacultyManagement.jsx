import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Search, ChevronLeft, ChevronRight,
  Calendar, UserX, UserCheck, Edit2, Trash2,
  ShieldAlert, BookOpen, Briefcase
} from 'lucide-react';

const statusStyles = {
  active:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const limit = 12;

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=faculty&page=${page}&limit=${limit}`);
      setFaculty(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setFaculty([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, [page]);

  const handleToggle = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      setFaculty(prev => prev.map(f => f.user_id === userId ? { ...f, is_active: res.data.is_active } : f));
    } catch {
      setFaculty(prev => prev.map(f => f.user_id === userId ? { ...f, is_active: !f.is_active } : f));
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/users/${selectedFaculty.user_id}`, selectedFaculty);
      setFaculty(prev => prev.map(f => f.user_id === selectedFaculty.user_id ? { ...f, ...res.data } : f));
      setShowEditModal(false);
      fetchFaculty();
    } catch { console.error('Update failed'); }
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    try {
      await api.delete(`/admin/users/${facultyToDelete.user_id}`);
      setFacultyToDelete(null);
      fetchFaculty();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete faculty member.';
      setFacultyToDelete(null);
      setErrorModal({
        title: err.response?.status === 409 ? 'Cannot Delete Faculty Member' : 'Deletion Failed',
        message: msg,
      });
    }
  };

  const filtered = search
    ? faculty.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase()))
    : faculty;

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 bg-violet-50 px-3 py-1 rounded-full">Faculty Registry</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-md">
              Manage all faculty members — review profiles, control system access, and track academic assignments.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{total}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Faculty</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by faculty name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px] font-medium text-slate-700 placeholder-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold">Clear</button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-lg">All Faculty Members</h2>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Showing <span className="text-slate-700 font-bold">{filtered.length}</span> of <span className="text-slate-700 font-bold">{total}</span> records
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty Member</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-right px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-4"><div className="h-10 bg-slate-100 rounded-xl w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-7 bg-slate-100 rounded-full w-20" /></td>
                      <td className="px-8 py-4"><div className="h-8 bg-slate-100 rounded-xl w-28 ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                          <BookOpen size={40} />
                        </div>
                        <p className="text-slate-900 font-bold">No Faculty Found</p>
                        <p className="text-slate-400 text-sm">Refine your search to locate a specific faculty member.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(f => (
                    <tr key={f.user_id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 flex items-center justify-center text-violet-700 font-black text-sm group-hover:scale-105 transition-transform">
                            {f?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                            <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wider">Faculty</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 text-[13px] font-medium">{f.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(f.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 text-[11px] font-black uppercase tracking-wider ${f.is_active ? statusStyles.active : statusStyles.inactive}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${f.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          {f.is_active ? 'Active' : 'Suspended'}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(f.user_id)}
                            disabled={togglingId === f.user_id}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${f.is_active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                            title={f.is_active ? 'Suspend Account' : 'Activate Account'}
                          >
                            {togglingId === f.user_id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : f.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => { setSelectedFaculty(f); setShowEditModal(true); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-500 bg-violet-50 hover:bg-violet-100 transition-all"
                            title="Edit Faculty"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setFacultyToDelete(f)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all"
                            title="Delete Faculty"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-700">{page}</span> of <span className="text-slate-700">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages || 0)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
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
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                {selectedFaculty.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Edit Faculty</h2>
                <p className="text-slate-400 text-[12px] font-medium">Modify profile details for this faculty member.</p>
              </div>
            </div>
            <form onSubmit={handleUpdateFaculty} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input
                  value={selectedFaculty.name}
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, name: e.target.value })}
                  required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input
                  value={selectedFaculty.email}
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, email: e.target.value })}
                  type="email" required className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px]"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {facultyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 relative z-10 border-4 border-rose-50">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Remove Faculty?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
              You are permanently removing <span className="text-slate-900 font-bold">{facultyToDelete.name}</span> from the system. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setFacultyToDelete(null)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200">Cancel</button>
              <button type="button" onClick={handleDeleteFaculty} className="flex-[2] px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[14px] hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 active:scale-[0.98] transition-all">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-amber-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100 relative z-10 border-4 border-amber-50">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">{errorModal.title}</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[300px] mx-auto">{errorModal.message}</p>
            <button type="button" onClick={() => setErrorModal(null)} className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[14px] hover:bg-slate-800 transition-all">Got it</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyManagement;
