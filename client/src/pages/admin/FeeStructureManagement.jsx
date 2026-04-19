import usePageTitle from '../../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  DollarSign, Plus, Trash2, Search, Filter, 
  ChevronRight, BookOpen, GraduationCap, Calendar, 
  Layers, Info, AlertCircle, CheckCircle2, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
const categories = ['Tuition Fee', 'Admission Fee', 'Library Fee', 'Lab Fee', 'Examination Fee', 'Sports Fee', 'Security Deposit'];
const programs = ['BSCS', 'BSIT', 'BBA', 'MCS', 'MBA', 'PhD CS'];
const semesters = ['Fall 2024', 'Spring 2024', 'Fall 2023', 'Spring 2023'];
const FeeStructureManagement = () => {
  usePageTitle('Fee Structure Management');
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterProgram, setFilterProgram] = useState('all');
  const fetchStructures = async () => {
    try {
      const res = await api.get('/admin/fee-structures');
      setStructures(res.data);
    } catch (err) {
      toast.error('Failed to synchronize fee records');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStructures();
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
      toast.success('Fee configuration deployed successfully');
    } catch (err) {
      toast.error('Failed to register fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/fee-structures/${id}`);
      setStructures(structures.filter(s => s.structure_id !== id));
      toast.success('Fee structure withdrawn');
    } catch (err) {
      toast.error('Withdrawal failed');
    }
  };
  const filtered = structures.filter(s => {
    const matchesSearch = s.program.toLowerCase().includes(search.toLowerCase()) || 
                          s.category.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = filterProgram === 'all' || s.program === filterProgram;
    return matchesSearch && matchesProgram;
  });
  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Syncing Financial Ledger...</p>
    </div>
  );
  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Matrix Configuration</h1>
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
            placeholder="Search programs or categories..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 rounded-2xl text-sm transition-all focus:bg-white focus:outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setFilterProgram('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterProgram === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Programs
          </button>
          {programs.map((p) => (
            <button
              key={p}
              onClick={() => setFilterProgram(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterProgram === p ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.structure_id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600 group-hover:scale-150 transition-all duration-700 opacity-50 group-hover:opacity-10" />
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    <DollarSign size={28} />
                  </div>
                  <button 
                    onClick={() => handleDelete(item.structure_id)}
                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
               <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{item.category}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.program}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.semester}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Amount</p>
                      <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                        <span className="text-sm font-bold text-slate-400 mr-1">Rs</span>
                        {parseFloat(item.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 bg-slate-50 rounded-full items-center justify-center">
                       <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Layers size={40} />
             </div>
             <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No financial components found</p>
          </div>
        )}
      </div>
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Fee Component</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Schema Provisioning</p>
                  </div>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Academic Program</label>
                       <select name="program" required className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl text-[13px] font-bold text-slate-900 outline-none transition-all appearance-none tracking-tight">
                        {programs.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Applies to Semester</label>
                       <select name="semester" required className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl text-[13px] font-bold text-slate-900 outline-none transition-all appearance-none tracking-tight">
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fee Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(c => (
                        <div key={c} className="relative group">
                          <input type="radio" name="category" value={c} id={`cat-${c}`} required className="peer hidden" defaultChecked={c === 'Tuition Fee'} />
                          <label htmlFor={`cat-${c}`} className="block px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-[11px] font-bold text-slate-600 peer-checked:bg-white peer-checked:border-indigo-600 peer-checked:text-indigo-600 cursor-pointer transition-all hover:bg-slate-100">
                             {c}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Amount (PKR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" 
                        name="amount" 
                        required 
                        placeholder="e.g. 50000"
                        className="w-full pl-12 pr-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xl placeholder:text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Configuring System...' : 'Deploy Matrix'}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default FeeStructureManagement;
