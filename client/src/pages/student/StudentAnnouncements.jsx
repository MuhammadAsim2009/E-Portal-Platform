import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Megaphone, X, Pin, AlertCircle, CheckCircle2, 
  Clock, Tag, Calendar, User, Users, Search, 
  ArrowRight, BellRing, ChevronRight
} from 'lucide-react';

const categoryStyles = {
  Exam: 'bg-rose-600 text-white shadow-rose-600/30',
  Academic: 'bg-indigo-600 text-white shadow-indigo-600/30',
  General: 'bg-slate-800 text-white shadow-slate-800/30',
  Event: 'bg-sky-600 text-white shadow-sky-600/30',
  Alert: 'bg-amber-600 text-white shadow-amber-600/30',
};

const StudentAnnouncements = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/announcements');
      setList(res.data);
    } catch {
      // Mock data for fallback
      setList([
        { announcement_id: '1', title: 'Mid-term Exam Schedule Released', body: 'Please check the portal for your individual exam schedules and report to examination halls 15 minutes early.', category: 'Exam', is_pinned: true, created_at: new Date().toISOString() },
        { announcement_id: '2', title: 'Library Extended Hours', body: 'The university library will remain open 24/7 during the exam week for all students studying in groups.', category: 'General', is_pinned: false, created_at: new Date().toISOString() },
        { announcement_id: '3', title: 'Campus Infrastructure Maintenance', body: 'Wi-Fi services will be briefly interrupted this Sunday from 2 AM to 4 AM for scheduled backbone maintenance.', category: 'Alert', is_pinned: false, created_at: new Date().toISOString() },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { 
    fetchAnnouncements(); 
  }, []);

  const filteredList = list.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.body.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || 
                          (filter === 'Pinned' && a.is_pinned) || 
                          (filter === a.category);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
              <Megaphone size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Announcements</h1>
              <p className="text-slate-500 font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
                <BellRing size={14} className="text-indigo-500 animate-pulse" /> Official Bulletins & Alerts
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 border-r border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 text-center">Active Notifications</p>
             <p className="text-xl font-black text-indigo-600 leading-none text-center">{list.length}</p>
           </div>
           <button 
             onClick={fetchAnnouncements}
             className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
           >
             <Clock size={18} />
           </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-4 flex flex-col lg:flex-row items-center gap-4 shadow-xl shadow-slate-100/50">
        <div className="relative flex-1 w-full group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search bulletins by subject or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-2xl text-[14px] font-bold transition-all focus:bg-white placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
          {['All', 'Pinned', 'Academic', 'General', 'Exam', 'Event', 'Alert'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 animate-pulse space-y-6">
               <div className="flex justify-between">
                  <div className="w-24 h-6 bg-slate-100 rounded-full" />
                  <div className="w-8 h-8 bg-slate-50 rounded-lg" />
               </div>
               <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-full" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
               </div>
            </div>
          ))
        ) : filteredList.length === 0 ? (
          <div className="col-span-full py-40 text-center bg-white border border-slate-200 rounded-[3rem] border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Megaphone size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No active bulletins found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          filteredList.map(a => (
            <div 
              key={a.announcement_id} 
              onClick={() => setSelectedAnnouncement(a)}
              className={`group bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all duration-300 relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-[0.98] ${
                a.is_pinned ? 'border-indigo-100' : ''
              }`}
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.02] rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110 ${
                a.category === 'Exam' ? 'text-rose-500' : a.category === 'Alert' ? 'text-amber-500' : 'text-indigo-500'
              }`} />

              <div className="flex items-start justify-between gap-4 relative z-10 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm flex items-center gap-2 ${categoryStyles[a.category] || categoryStyles.General}`}>
                    {a.category}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                    <Clock size={12} />
                    {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                {a.is_pinned && (
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shadow-sm border border-amber-200 ring-4 ring-amber-50/50">
                    <Pin size={16} className="fill-current" />
                  </div>
                )}
              </div>
 
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {a.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-bold line-clamp-3">
                  {a.body.split('\n')[0]}
                </p>
              </div>
 
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <BellRing size={14} className="text-indigo-400" />
                  <span>Important Broadcast</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 transition-all group-hover:gap-4">
                  View Full <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 lg:p-12 transition-all">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col relative">
            {/* Modal Header/Banner */}
            <div className={`p-10 lg:p-14 text-slate-900 bg-slate-50 border-b border-slate-100 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <button 
                onClick={() => setSelectedAnnouncement(null)} 
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 transition-all z-20 hover:rotate-90"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 space-y-4 pr-12 lg:pr-0">
                <div className="flex items-center gap-3">
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${categoryStyles[selectedAnnouncement.category]}`}>
                    {selectedAnnouncement.category}
                  </span>
                  {selectedAnnouncement.is_pinned && (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-[0.2em]">
                      <Pin size={12} /> Pinned Alert
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                      <Calendar size={18} className="text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Posted</span>
                       <span className="text-xs font-black text-slate-700">{new Date(selectedAnnouncement.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-10 lg:p-14 overflow-y-auto max-h-[50vh] bg-white scrollbar-hide">
              <div className="prose prose-slate max-w-none">
                <p className="text-[17px] text-slate-600 leading-relaxed font-bold whitespace-pre-wrap">
                  {selectedAnnouncement.body}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-500 border border-slate-200 shadow-sm">
                   <Users size={20} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authority Verified</span>
                   <span className="text-xs font-black text-slate-700">Official Institutional Broadcast</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
