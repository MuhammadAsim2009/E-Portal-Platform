import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import {
  Search, ChevronLeft, ChevronRight, X,
  Calendar, UserX, UserCheck, Edit2, Trash2,
  Eye, EyeOff, ShieldAlert, GraduationCap, Plus,
  Users, UserCheck2, UserMinus, Upload, Download,
  FileSpreadsheet, CheckCircle2, AlertCircle
} from 'lucide-react';

const statusStyles = {
  active:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-200',
};
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const CSV_HEADERS = ['name', 'email', 'password', 'date_of_birth', 'gender', 'contact_number'];
const CSV_EXAMPLE = [
  'Muhammad Asim,asim@university.edu,Pass@1234,2000-05-15,Male,+92 300 1234567',
  'Aisha Khan,aisha@university.edu,SecurePass1,1999-11-20,Female,+92 321 7654321',
];

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

const StudentManagement = () => {
  const [students, setStudents]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [togglingId, setTogglingId]   = useState(null);

  // Add Single
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [addLoading, setAddLoading]         = useState(false);

  // Add Bulk
  const [showBulkModal, setShowBulkModal]   = useState(false);
  const [csvRows, setCsvRows]               = useState([]);          // parsed rows
  const [bulkLoading, setBulkLoading]       = useState(false);
  const [bulkResult, setBulkResult]         = useState(null);        // { success, failed, message }
  const [dragOver, setDragOver]             = useState(false);
  const fileInputRef = useRef();

  // Edit / Delete
  const [showEditModal, setShowEditModal]       = useState(false);
  const [selectedStudent, setSelectedStudent]   = useState(null);
  const [studentToDelete, setStudentToDelete]   = useState(null);
  const [errorModal, setErrorModal]             = useState(null);

  const limit = 12;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=student&page=${page}&limit=${limit}`);
      setStudents(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); setStudents([]); setTotal(0); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [page]);

  const activeCount   = students.filter(s => s.is_active).length;
  const inactiveCount = students.filter(s => !s.is_active).length;

  /* ── CSV helpers ── */
  const downloadTemplate = () => {
    const content = [CSV_HEADERS.join(','), ...CSV_EXAMPLE].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
    });
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      setCsvRows(rows);
      setBulkResult(null);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!csvRows.length) return;
    setBulkLoading(true);
    try {
      const res = await api.post('/admin/users/bulk', csvRows);
      setBulkResult(res.data);
      setCsvRows([]);
      fetchStudents();
    } catch (err) {
      setBulkResult({ message: err.response?.data?.message || 'Import failed.', success: [], failed: [] });
    } finally { setBulkLoading(false); }
  };

  const closeBulkModal = () => {
    setShowBulkModal(false); setCsvRows([]); setBulkResult(null);
  };

  /* ── CRUD handlers ── */
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'), email: fd.get('email'),
      password: fd.get('password'), role: 'student',
      date_of_birth: fd.get('date_of_birth') || null,
      gender: fd.get('gender') || null,
      contact_number: fd.get('contact_number') || null,
    };
    setAddLoading(true);
    try {
      await api.post('/admin/users', data);
      setShowAddModal(false); setShowPassword(false); e.target.reset(); fetchStudents();
    } catch (err) {
      setErrorModal({ title: 'Failed to Add Student', message: err.response?.data?.message || 'An error occurred.' });
    } finally { setAddLoading(false); }
  };

  const handleToggle = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      setStudents(prev => prev.map(s => s.user_id === userId ? { ...s, is_active: res.data.is_active } : s));
    } catch { setStudents(prev => prev.map(s => s.user_id === userId ? { ...s, is_active: !s.is_active } : s)); }
    finally { setTogglingId(null); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/users/${selectedStudent.user_id}`, selectedStudent);
      setStudents(prev => prev.map(s => s.user_id === selectedStudent.user_id ? { ...s, ...res.data } : s));
      setShowEditModal(false); fetchStudents();
    } catch { console.error('Update failed'); }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await api.delete(`/admin/users/${studentToDelete.user_id}`);
      setStudentToDelete(null); fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete.';
      setStudentToDelete(null);
      setErrorModal({ title: err.response?.status === 409 ? 'Cannot Delete Enrolled Student' : 'Deletion Failed', message: msg });
    }
  };

  const filtered   = search ? students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())) : students;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Student Registry</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-md">Manage all registered students — view profiles, control access, and maintain academic records.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FileSpreadsheet size={16} className="text-indigo-500" />
              Bulk Import
            </button>
            <button
              onClick={() => { setShowAddModal(true); setShowPassword(false); }}
              className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-[13px] hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard icon={Users}      label="Total Students"  value={total}         color="bg-gradient-to-br from-indigo-500 to-violet-600" />
          <StatCard icon={UserCheck2} label="Active Students" value={activeCount}   color="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={UserMinus}  label="Suspended"       value={inactiveCount} color="bg-gradient-to-br from-rose-500 to-pink-500" />
        </div>

        {/* ── Search ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by student name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px] font-medium text-slate-700 placeholder-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors">Clear</button>}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="font-black text-slate-900 text-lg">All Students</h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Showing <span className="text-slate-700 font-bold">{filtered.length}</span> of <span className="text-slate-700 font-bold">{total}</span> records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Student', 'Financials', 'Joined', 'Status', 'Actions'].map((h, i) => (
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
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300"><GraduationCap size={40} /></div>
                      <p className="text-slate-900 font-bold">No Students Found</p>
                      <p className="text-slate-400 text-sm">Refine your search or add a new student.</p>
                    </div>
                  </td></tr>
                ) : filtered.map(s => (
                  <tr key={s.user_id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm group-hover:scale-105 transition-transform">
                          {s?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.is_delinquent ? (
                        <div className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                          <AlertCircle size={10} /> Delinquent
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle2 size={10} /> Cleared
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 text-[11px] font-black uppercase tracking-wider ${s.is_active ? statusStyles.active : statusStyles.inactive}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {s.is_active ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(s.user_id)} disabled={togglingId === s.user_id}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${s.is_active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                          title={s.is_active ? 'Suspend' : 'Activate'}>
                          {togglingId === s.user_id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : s.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button onClick={() => { setSelectedStudent(s); setShowEditModal(true); }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setStudentToDelete(s)}
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
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>{i + 1}</button>
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
          ADD SINGLE STUDENT MODAL
      ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-slate-900">Add New Student</h2>
                <p className="text-slate-400 text-[12px] font-medium">Role auto-set to <span className="text-indigo-500 font-bold">Student</span></p>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowPassword(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="px-8 pt-6 pb-8 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name <span className="text-rose-500">*</span></label>
                <input name="name" required placeholder="e.g. Muhammad Asim"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all" />
              </div>

              {/* Email + Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email <span className="text-rose-500">*</span></label>
                  <input name="email" type="email" required placeholder="student@uni.edu"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 chars"
                      className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DoB + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                  <input name="date_of_birth" type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                  <select name="gender"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all text-slate-600 appearance-none">
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                <input name="contact_number" type="tel" placeholder="+92 300 0000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none transition-all" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setShowPassword(false); }}
                  className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={addLoading}
                  className="flex-[2] px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[13px] hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {addLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                  {addLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BULK IMPORT MODAL
      ══════════════════════════════════════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <FileSpreadsheet size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-slate-900">Bulk Import Students</h2>
                <p className="text-slate-400 text-[12px] font-medium">Download the template, fill it in, and upload to import.</p>
              </div>
              <button onClick={closeBulkModal}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {/* Step 1: Download template */}
              <div className="flex items-center justify-between bg-indigo-50 rounded-2xl px-6 py-4 border border-indigo-100">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Step 1 — Download Template</p>
                  <p className="text-slate-500 text-[12px] mt-0.5">CSV with columns: name, email, password, date_of_birth, gender, contact_number</p>
                </div>
                <button onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[12px] hover:bg-indigo-700 transition-all shadow-sm flex-shrink-0 ml-4">
                  <Download size={14} /> Download CSV
                </button>
              </div>

              {/* Step 2: Upload */}
              <div>
                <p className="font-bold text-slate-800 text-sm mb-3">Step 2 — Upload Filled Template</p>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className={`${dragOver ? 'text-indigo-500' : 'text-slate-300'} transition-colors`} />
                    <p className="font-bold text-slate-700 text-sm">{dragOver ? 'Drop the file here' : 'Click or drag & drop your CSV file'}</p>
                    <p className="text-slate-400 text-[12px]">Only <span className="font-bold">.csv</span> files are supported</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
                    onChange={e => handleFileChange(e.target.files[0])} />
                </div>
              </div>

              {/* Preview */}
              {csvRows.length > 0 && !bulkResult && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-700 text-sm mb-3">
                    <span className="text-indigo-600">{csvRows.length}</span> student(s) parsed and ready to import
                  </p>
                  <div className="overflow-x-auto max-h-40 overflow-y-auto rounded-xl">
                    <table className="w-full text-[11px]">
                      <thead className="bg-white">
                        <tr>{CSV_HEADERS.map(h => <th key={h} className="text-left px-3 py-2 font-black uppercase tracking-wider text-slate-400">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvRows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {CSV_HEADERS.map(h => <td key={h} className="px-3 py-2 text-slate-600 font-medium truncate max-w-[120px]">{row[h] || '—'}</td>)}
                          </tr>
                        ))}
                        {csvRows.length > 5 && (
                          <tr><td colSpan={CSV_HEADERS.length} className="px-3 py-2 text-slate-400 font-medium text-center">
                            + {csvRows.length - 5} more row(s) not shown
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Result */}
              {bulkResult && (
                <div className={`rounded-2xl border p-5 ${bulkResult.failed?.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className="font-black text-slate-800 text-sm mb-3">{bulkResult.message}</p>
                  {bulkResult.success?.length > 0 && (
                    <div className="flex items-center gap-2 text-emerald-700 text-[12px] font-bold mb-1">
                      <CheckCircle2 size={14} /> {bulkResult.success.length} account(s) created successfully
                    </div>
                  )}
                  {bulkResult.failed?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {bulkResult.failed.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-rose-700 text-[11px]">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" />
                          <span><span className="font-bold">{f.email}</span>: {f.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={closeBulkModal}
                className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">
                {bulkResult ? 'Close' : 'Cancel'}
              </button>
              {!bulkResult && (
                <button onClick={handleBulkImport} disabled={csvRows.length === 0 || bulkLoading}
                  className="flex-[2] px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[13px] hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40">
                  {bulkLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={15} />}
                  {bulkLoading ? 'Importing...' : `Import ${csvRows.length || ''} Student(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">{selectedStudent.name?.[0]?.toUpperCase()}</div>
              <div className="flex-1"><h2 className="text-lg font-black text-slate-900">Edit Student</h2><p className="text-slate-400 text-[12px] font-medium">Modify profile details.</p></div>
              <button onClick={() => setShowEditModal(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateStudent} className="px-8 py-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input value={selectedStudent.name} onChange={e => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                  required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input value={selectedStudent.email} onChange={e => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                  type="email" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 font-medium text-[13px] outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 relative z-10 border-4 border-rose-50"><Trash2 size={32} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Remove Student?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
              Permanently deleting <span className="text-slate-900 font-bold">{studentToDelete.name}</span>'s record. This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStudentToDelete(null)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200">Cancel</button>
              <button type="button" onClick={handleDeleteStudent} className="flex-[2] px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[14px] hover:bg-rose-700 active:scale-[0.98] transition-all">Yes, Remove</button>
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

export default StudentManagement;
