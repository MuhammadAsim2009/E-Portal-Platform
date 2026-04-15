import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Megaphone, Plus, X, Pin, AlertCircle, CheckCircle2, 
  Clock, Target, Tag, Calendar, User, Users, Shield,
  ArrowRight, Search, Zap, MoreHorizontal, BellRing
} from 'lucide-react';

const TARGET_ROLES = ['all', 'student', 'faculty', 'admin'];
const CATEGORIES = ['Academic', 'General', 'Exam', 'Event', 'Alert'];

const targetStyles = {
  all: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  student: 'bg-sky-50 text-sky-700 border-sky-100',
  faculty: 'bg-violet-50 text-violet-700 border-violet-100',
  admin: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const categoryStyles = {
  Exam: 'bg-rose-500 text-white shadow-rose-500/20',
  Academic: 'bg-indigo-500 text-white shadow-indigo-500/20',
  General: 'bg-slate-500 text-white shadow-slate-500/20',
  Event: 'bg-emerald-500 text-white shadow-emerald-500/20',
  Alert: 'bg-amber-500 text-white shadow-amber-500/20',
};

const Announcements = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [form, setForm] = useState({
    title: '', body: '', category: 'Academic',
    target_role: 'all', expiry_date: '', is_pinned: false,
  });

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 3500);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      setList(res.data);
    } catch {
      setList([
        { announcement_id: '1', title: 'Mid-term Exam Schedule Released', body: 'Please check the portal for your individual exam schedules and report to examination halls 15 minutes early.', category: 'Exam', target_role: 'student', is_pinned: true, created_at: new Date().toISOString() },
        { announcement_id: '2', title: 'Library Extended Hours', body: 'The university library will remain open 24/7 during the exam week for all students studying in groups.', category: 'General', target_role: 'all', is_pinned: false, created_at: new Date().toISOString() },
        { announcement_id: '3', title: 'Faculty Meeting — April 18th', body: 'All faculty members are required to attend the departmental review meeting on Friday, April 18th at 2:00 PM in Hall B.', category: 'Academic', target_role: 'faculty', is_pinned: false, created_at: new Date().toISOString() },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/announcements', form);
      // Backend might return the new object
      setList([res.data || { ...form, announcement_id: Date.now().toString(), created_at: new Date().toISOString() }, ...list]);
      setShowModal(false);
      setForm({ title: '', body: '', category: 'Academic', target_role: 'all', expiry_date: '', is_pinned: false });
      showToast('success', 'Announcement published and distributed!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to publish.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList = list.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.body.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || 
                          (filter === 'Pinned' && a.is_pinned) || 
                          (filter === a.category);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Premium Toast */}
      {toast.show && (
        <div className={`fixed top-8 right-8 z-[60] flex items-center gap-4 pl-5 pr-6 py-5 rounded-[2rem] shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-right-8 duration-500 font-bold ${
          toast.type === 'success' ? 'bg-indigo-600/90 text-white border-indigo-400' : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            {toast.type === 'success' ? <BellRing size={20} /> : <AlertCircle size={20} />}
          </div>
          <p className="text-sm">{toast.msg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
              <Megaphone size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Broadcast system-wide communications and critical updates.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Feed Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search bulletins by keyword or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-[13px] font-medium transition-all focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['All', 'Pinned', 'Academic', 'General', 'Exam', 'Event', 'Alert'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] p-10 animate-pulse space-y-6">
              <div className="flex gap-4">
                 <div className="w-16 h-4 bg-slate-100 rounded-full" />
                 <div className="w-16 h-4 bg-slate-50 rounded-full" />
              </div>
              <div className="h-8 bg-slate-100 rounded-full w-2/3" />
            </div>
          ))
        ) : filteredList.length === 0 ? (
          <div className="py-32 text-center glass-card rounded-[3rem] border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Megaphone size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 brand-font mb-2">No Active Broadcasts</h3>
            <p className="text-slate-400 text-sm">Create your first announcement to reach your organization.</p>
          </div>
        ) : (
          filteredList.map(a => (
            <div 
              key={a.announcement_id} 
              onClick={() => setSelectedAnnouncement(a)}
              className={`bg-white border border-slate-200 rounded-3xl p-7 lg:p-8 group hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-[0.99] ${
                a.is_pinned ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/20' : ''
              }`}
            >
              {a.is_pinned && (
                <div className="absolute top-0 right-0 p-6">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-lg shadow-sm border border-amber-200">
                    <Pin size={16} className="fill-current" />
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm flex items-center gap-2 ${categoryStyles[a.category] || categoryStyles.General}`}>
                  <Tag size={12} />
                  {a.category}
                </span>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${targetStyles[a.target_role]}`}>
                  <Target size={12} />
                  {a.target_role}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  <Clock size={12} />
                  {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>
 
              <div className="max-w-4xl space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                  {a.body}
                </p>
              </div>
 
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <Users size={14} className="text-indigo-400" />
                     <span>Distribution Active</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <Zap size={14} className="text-amber-500 fill-amber-500/20" />
                     <span>Priority Broadcast</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 group-hover:gap-4 transition-all">
                  Read Announcement <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 lg:p-12 transition-all">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col lg:flex-row">
            {/* Modal Sidebar */}
            <div className="lg:w-72 bg-slate-900 p-10 text-white flex flex-col justify-between overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
               <div className="relative z-10">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-600/20">
                   <Megaphone size={28} />
                 </div>
                 <h2 className="text-3xl font-black brand-font mb-4 leading-tight">Broadcast Center</h2>
                 <p className="text-slate-400 text-sm font-bold leading-relaxed">Publish critical updates to the university network instantly.</p>
               </div>
               <div className="relative z-10 space-y-4 pt-10">
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                   <CheckCircle2 size={16} className="text-emerald-500" /> Instant Push
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                   <CheckCircle2 size={16} className="text-emerald-500" /> Multi-Role Targeting
                 </div>
               </div>
            </div>

            {/* Modal Form */}
            <div className="flex-1 p-10 lg:p-12 overflow-y-auto max-h-[85vh]">
              <div className="flex justify-end mb-6">
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Header</label>
                  <input required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief, descriptive title..."
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-[13px] font-bold text-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                  <textarea required rows={5} value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    placeholder="Provide full details of the announcement..."
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-[13px] font-bold text-slate-900 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Tag size={12} /> Category
                    </label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-[13px] font-bold text-slate-900 transition-all appearance-none cursor-pointer">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Users size={12} /> Target Audience
                    </label>
                    <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-[13px] font-bold text-slate-900 transition-all appearance-none cursor-pointer capitalize">
                      {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Calendar size={12} /> Automated Expiry
                    </label>
                    <input type="date" value={form.expiry_date}
                      onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-[13px] font-bold text-slate-900 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 px-6 py-4 bg-amber-50 rounded-2xl border border-amber-100 mt-6 md:mt-0">
                    <input type="checkbox" checked={form.is_pinned}
                      onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                      className="w-5 h-5 text-amber-500 rounded-lg focus:ring-amber-400 border-amber-200"
                    />
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black uppercase tracking-[0.1em] text-amber-700">Priority Pin</span>
                       <span className="text-[10px] font-bold text-amber-600/70">Stick to top of all feeds</span>
                    </div>
                    <Pin size={18} className={`ml-auto ${form.is_pinned ? 'text-amber-500' : 'text-amber-200'}`} />
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                   <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
                   >
                    {submitting ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Push Broadcast <Zap size={18} /></>
                    )}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[150] flex items-center justify-center p-6 lg:p-12 transition-all">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col relative">
            <button 
              onClick={() => setSelectedAnnouncement(null)} 
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all z-20"
            >
              <X size={24} />
            </button>

            {/* Modal Header/Banner */}
            <div className={`p-12 lg:p-20 text-white relative overflow-hidden ${categoryStyles[selectedAnnouncement.category]?.split(' ')[0] || 'bg-slate-900'}`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    {selectedAnnouncement.category}
                  </span>
                  {selectedAnnouncement.is_pinned && (
                    <span className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-[0.2em]">
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-4xl lg:text-6xl font-black brand-font leading-[1.1] tracking-tight max-w-3xl">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Target</p>
                      <p className="text-sm font-bold capitalize">{selectedAnnouncement.target_role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Published</p>
                      <p className="text-sm font-bold">{new Date(selectedAnnouncement.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-12 lg:p-20 overflow-y-auto max-h-[50vh] bg-slate-50/50">
              <div className="prose prose-slate max-w-none">
                <p className="text-xl text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedAnnouncement.body}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                         <User size={16} />
                      </div>
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    +42
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400">Viewed by students & staff</p>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
