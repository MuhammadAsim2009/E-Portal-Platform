import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Search, ChevronLeft, ChevronRight, X,
  Calendar, UserX, UserCheck, Edit2, Trash2,
  Eye, EyeOff, ShieldAlert, Briefcase, Plus,
  Users, UserCheck2, UserMinus, GraduationCap,
  BookOpen, Award
} from 'lucide-react';

const statusStyles = {
  active:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value ?? '—'}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{label}</p>
    </div>
  </div>
);

const FacultyManagement = () => {
  const [faculty, setFaculty]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [togglingId, setTogglingId]   = useState(null);

  // Add Single
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [addLoading, setAddLoading]         = useState(false);

  // Edit / Delete
  const [showEditModal, setShowEditModal]       = useState(false);
  const [selectedFaculty, setSelectedFaculty]   = useState(null);
  const [facultyToDelete, setFacultyToDelete]   = useState(null);
  const [errorModal, setErrorModal]             = useState(null);

  const limit = 12;

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=faculty&page=${page}&limit=${limit}`);
      setFaculty(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); setFaculty([]); setTotal(0); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFaculty(); }, [page]);

  const activeCount   = faculty.filter(f => f.is_active).length;
  const inactiveCount = faculty.filter(f => !f.is_active).length;


  /* ── CRUD handlers ── */
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'), 
      email: fd.get('email'),
      password: fd.get('password'), 
      role: 'faculty',
      department: fd.get('department') || null,
      designation: fd.get('designation') || null,
      contact_number: fd.get('contact_number') || null,
      qualifications: fd.get('qualifications') || null,
    };
    setAddLoading(true);
    try {
      await api.post('/admin/users', data);
      setShowAddModal(false); setShowPassword(false); e.target.reset(); fetchFaculty();
    } catch (err) {
      setErrorModal({ title: 'Failed to Add Faculty', message: err.response?.data?.message || 'An error occurred.' });
    } finally { setAddLoading(false); }
  };

  const handleToggle = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      setFaculty(prev => prev.map(f => f.user_id === userId ? { ...f, is_active: res.data.is_active } : f));
    } catch { setFaculty(prev => prev.map(f => f.user_id === userId ? { ...f, is_active: !f.is_active } : f)); }
    finally { setTogglingId(null); }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/users/${selectedFaculty.user_id}`, selectedFaculty);
      setFaculty(prev => prev.map(f => f.user_id === selectedFaculty.user_id ? { ...f, ...res.data } : f));
      setShowEditModal(false); fetchFaculty();
    } catch { console.error('Update failed'); }
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    try {
      await api.delete(`/admin/users/${facultyToDelete.user_id}`);
      setFacultyToDelete(null); fetchFaculty();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete.';
      setFacultyToDelete(null);
      setErrorModal({ title: 'Deletion Failed', message: msg });
    }
  };

  const filtered   = search ? faculty.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())) : faculty;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 bg-violet-50 px-3 py-1 rounded-full">Faculty Management</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-md">Manage university instructors, professors, and academic staff memberships.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { setShowAddModal(true); setShowPassword(false); }}
              className="flex items-center gap-2.5 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-[13px] hover:bg-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-600/20"
            >
              <Plus size={18} /> Add Faculty
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard icon={Users}      label="Total Faculty"   value={total}         color="bg-gradient-to-br from-violet-500 to-purple-600" />
          <StatCard icon={UserCheck2} label="Active Staff"    value={activeCount}   color="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={UserMinus}  label="Suspended"       value={inactiveCount} color="bg-gradient-to-br from-rose-500 to-pink-500" />
        </div>

        {/* ── Search ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name, email or department..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px] font-medium text-slate-700 placeholder-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors">Clear</button>}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="font-black text-slate-900 text-lg">Academic Staff</h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Showing <span className="text-slate-700 font-bold">{filtered.length}</span> of <span className="text-slate-700 font-bold">{total}</span> records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Faculty Member', 'Department', 'Designation', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 4 ? 'text-right px-8' : 'text-left px-6'} ${i === 0 ? 'px-8' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-4"><div className="h-10 bg-slate-100 rounded-xl w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-7 bg-slate-100 rounded-full w-20" /></td>
                    <td className="px-8 py-4"><div className="h-8 bg-slate-100 rounded-xl w-28 ml-auto" /></td>
                  </tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300"><Briefcase size={40} /></div>
                      <p className="text-slate-900 font-bold">No Faculty Found</p>
                      <p className="text-slate-400 text-sm">Add your first academic staff member.</p>
                    </div>
                  </td></tr>
                ) : filtered.map(f => (
                  <tr key={f.user_id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 flex items-center justify-center text-violet-700 font-black text-sm group-hover:scale-105 transition-transform">
                          {f?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-slate-600 text-[13px] font-bold">{f.department || 'N/A'}</span></td>
                    <td className="px-6 py-4"><span className="text-slate-500 text-xs font-semibold">{f.designation || 'Faculty'}</span></td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 text-[11px] font-black uppercase tracking-wider ${f.is_active ? statusStyles.active : statusStyles.inactive}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${f.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {f.is_active ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(f.user_id)} disabled={togglingId === f.user_id}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${f.is_active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                          title={f.is_active ? 'Suspend' : 'Activate'}>
                          {togglingId === f.user_id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : f.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button onClick={() => { setSelectedFaculty(f); setShowEditModal(true); }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-500 bg-violet-50 hover:bg-violet-100 transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setFacultyToDelete(f)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page <span className="text-slate-700">{page}</span> of <span className="text-slate-700">{totalPages || 1}</span></p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-2">
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages || 0)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-2">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ADD SINGLE FACULTY MODAL
      ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                <Briefcase size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-slate-900">Add Faculty Member</h2>
                <p className="text-slate-400 text-[12px] font-medium">Role auto-set to <span className="text-violet-500 font-bold">Faculty</span></p>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowPassword(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="px-8 pt-6 pb-8 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name <span className="text-rose-500">*</span></label>
                <input name="name" required placeholder="e.g. Dr. Ahmed Ali"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
              </div>

              {/* Email + Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email <span className="text-rose-500">*</span></label>
                  <input name="email" type="email" required placeholder="faculty@uni.edu"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 chars"
                      className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Department + Designation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Department</label>
                  <input name="department" placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Designation</label>
                  <input name="designation" placeholder="e.g. Associate Professor"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                <input name="contact_number" type="tel" placeholder="+92 300 0000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all" />
              </div>

              {/* Qualifications */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Qualifications</label>
                <textarea name="qualifications" placeholder="e.g. PhD in Machine Learning, MS in Software Engineering" rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-medium text-[13px] outline-none transition-all resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setShowPassword(false); }}
                  className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={addLoading}
                  className="flex-[2] px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-[13px] hover:bg-violet-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {addLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                  {addLoading ? 'Adding...' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── Edit Modal ── */}
      {showEditModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">{selectedFaculty.name?.[0]?.toUpperCase()}</div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-slate-900">Edit Faculty Profile</h2>
                <p className="text-slate-400 text-[12px] font-medium">Modify staff details. Password resets are not handled here.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateFaculty} className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input value={selectedFaculty.name || ''} 
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, name: e.target.value })}
                  required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none" />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input type="email" value={selectedFaculty.email || ''} 
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, email: e.target.value })}
                  required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none" />
              </div>

              {/* Department + Designation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Department</label>
                  <input value={selectedFaculty.department || ''} 
                    onChange={e => setSelectedFaculty({ ...selectedFaculty, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Designation</label>
                  <input value={selectedFaculty.designation || ''} 
                    onChange={e => setSelectedFaculty({ ...selectedFaculty, designation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none" />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                <input value={selectedFaculty.contact_number || ''} 
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, contact_number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none" />
              </div>

              {/* Qualifications */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Qualifications</label>
                <textarea rows={2} value={selectedFaculty.qualifications || ''} 
                  onChange={e => setSelectedFaculty({ ...selectedFaculty, qualifications: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 font-medium text-[13px] outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-5 py-3 bg-violet-600 text-white rounded-xl font-bold text-[13px] hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {facultyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 relative z-10 border-4 border-rose-50"><Trash2 size={32} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Remove Instructor?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 max-w-[280px] mx-auto">
              This will permanently delete <span className="text-slate-900 font-bold">{facultyToDelete.name}</span>. Faculty courses and records will be affected.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setFacultyToDelete(null)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200">Cancel</button>
              <button type="button" onClick={handleDeleteFaculty} className="flex-[2] px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[14px] hover:bg-rose-700 active:scale-[0.98] transition-all">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Modal ── */}
      {errorModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-amber-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100 relative z-10 border-4 border-amber-50"><ShieldAlert size={32} /></div>
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
