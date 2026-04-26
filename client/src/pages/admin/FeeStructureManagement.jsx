import usePageTitle from '../../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  DollarSign, Plus, Trash2, Search, Filter, 
  ChevronRight, BookOpen, GraduationCap, Calendar, 
  Layers, Info, AlertCircle, CheckCircle2, MoreVertical, X, Edit2
} from 'lucide-react';

const categories = ['Section Fee', 'Tuition Fee', 'Admission Fee', 'Library Fee', 'Lab Fee', 'Examination Fee', 'Sports Fee', 'Security Deposit', 'Semester Fee'];
const courses_list = ['BSCS', 'BSIT', 'BBA', 'MCS', 'MBA', 'PhD CS'];

const FeeStructureManagement = () => {
  usePageTitle('Fee Matrix & Pricing');
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [editModal, setEditModal] = useState({ show: false, data: null });
  
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [toastTimer, setToastTimer] = useState(null);

  const showToast = (type, msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ show: true, type, msg });
    const timer = setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
    setToastTimer(timer);
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/admin/fee-structures');
      setStructures(res.data);
    } catch (err) {
      showToast('error', 'Failed to synchronize fee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
    const fetchData = async () => {
      try {
        const cRes = await api.get('/admin/courses');
        setCourses(cRes.data || []);
      } catch (err) { console.error('Error fetching dropdown data:', err); }
    };
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      const res = await api.post('/admin/fee-structures', data);
      setStructures([res.data, ...structures]);
      setShowAddModal(false);
      showToast('success', 'Fee configuration deployed successfully');
    } catch (err) {
      showToast('error', 'Failed to register fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      const res = await api.patch(`/admin/fee-structures/${editModal.data.structure_id}`, data);
      setStructures(structures.map(s => s.structure_id === editModal.data.structure_id ? res.data : s));
      setEditModal({ show: false, data: null });
      showToast('success', 'Fee configuration updated successfully');
    } catch (err) {
      showToast('error', 'Failed to update fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/fee-structures/${id}`);
      setStructures(structures.filter(s => s.structure_id !== id));
      showToast('success', 'Fee structure withdrawn');
    } catch (err) {
      showToast('error', 'Withdrawal failed');
    }
  };

  const filtered = structures.filter(s => {
    const matchesSearch = (s.program?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (s.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (s.course_title?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCourse = filterCourse === 'all' || String(s.course_id) === String(filterCourse);
    return matchesSearch && matchesCourse;
  });

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Syncing Financial Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Matrix & Pricing</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm italic">
            <DollarSign size={16} className="text-emerald-500" />
            Defining the institutional financial architecture
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={16} />
          New Configuration
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search courses or categories..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 rounded-2xl text-sm transition-all focus:bg-white focus:outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 text-slate-400">
            <BookOpen size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Course</span>
          </div>
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none pr-8 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">Global Course View</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.structure_id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
               {/* Decorative Element */}
               <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full -mr-20 -mt-20 group-hover:bg-indigo-600 group-hover:scale-150 transition-all duration-700 opacity-50 group-hover:opacity-10" />
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                    <DollarSign size={32} strokeWidth={2.5} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditModal({ show: true, data: item })}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.structure_id)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
               </div>

               <div className="space-y-6 relative z-10">
                  <div>
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] mb-3">
                      {item.category}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {item.course_title || 'General Curriculum'}
                    </h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                      Universal Course Fee
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Rate</p>
                      <div className="flex items-baseline">
                        <span className="text-sm font-bold text-slate-400 mr-1.5">PKR</span>
                        <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">
                          {parseFloat(item.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                       <CheckCircle2 size={24} />
                    </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <DollarSign size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Fee Structures Found</h3>
            <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto text-center px-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10 max-h-[85vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Fee Configuration</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecting Pricing Models</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="mb-6 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Selection</label>
                     <select name="course_id" required className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all">
                       <option value="">Select Curriculum</option>
                       {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                     </select>
                  </div>

                  <div className="mb-6 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fee Category</label>
                     <select name="category" required className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all">
                       {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                  </div>

                  <div className="mb-8 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantum Amount (PKR)</label>
                     <div className="relative group">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       <input 
                         type="number" 
                         name="amount" 
                         required 
                         placeholder="Enter Value" 
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
                       />
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                      {isSubmitting ? 'Processing...' : 'Deploy Configuration'}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 text-slate-900">
              <div className="p-10 max-h-[85vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg -rotate-3">
                    <Edit2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modify Pricing</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recalibrating Sectional Units</p>
                  </div>
                  <button onClick={() => setEditModal({ show: false, data: null })} className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="mb-6 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Course Unit</label>
                     <select 
                       name="course_id" 
                       required 
                       defaultValue={editModal.data.course_id}
                       className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                     >
                       {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                     </select>
                  </div>

                  <div className="mb-6 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category Label</label>
                     <select 
                       name="category" 
                       required 
                       defaultValue={editModal.data.category}
                       className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                     >
                       {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                  </div>

                  <div className="mb-8 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantum Amount (PKR)</label>
                     <div className="relative group">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       <input 
                         type="number" 
                         name="amount" 
                         required 
                         defaultValue={editModal.data.amount}
                         placeholder="Enter Revised Amount" 
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
                       />
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button type="button" onClick={() => setEditModal({ show: false, data: null })} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                      {isSubmitting ? 'Updating...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[200] animate-in fade-in slide-in-from-right-8 duration-500">
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
          <div className="absolute bottom-0 left-0 h-1 rounded-full bg-white/30 animate-progress origin-left" style={{ animationDuration: '5000ms' }}></div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureManagement;
