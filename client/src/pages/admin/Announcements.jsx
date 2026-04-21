import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Megaphone, Plus, X, Pin, AlertCircle, CheckCircle2, 
  Clock, Target, Tag, Calendar, User, Users, Shield, Mail,
  ArrowRight, Search, Zap, MoreHorizontal, BellRing, Trash2, Pencil
} from 'lucide-react';
const TARGET_ROLES = ['all', 'student', 'faculty', 'admin', 'individual'];
const CATEGORIES = ['Academic', 'General', 'Exam', 'Event', 'Alert'];
const targetStyles = {
  all: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  student: 'bg-sky-50 text-sky-700 border-sky-100',
  faculty: 'bg-violet-50 text-violet-700 border-violet-100',
  admin: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  individual: 'bg-rose-50 text-rose-700 border-rose-100',
};
const categoryStyles = {
  Exam: 'bg-rose-600 text-white shadow-rose-600/30',
  Academic: 'bg-indigo-600 text-white shadow-indigo-600/30',
  General: 'bg-slate-800 text-white shadow-slate-800/30',
  Event: 'bg-sky-600 text-white shadow-sky-600/30',
  Alert: 'bg-amber-600 text-white shadow-amber-600/30',
};
const Announcements = () => {
  usePageTitle('Announcements');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [form, setForm] = useState({
    title: '', body: '', category: 'Academic',
    target_role: 'all', target_user_id: '', expiry_date: '', 
    is_pinned: false, send_email: false
  });
  const [users, setUsers] = useState([]);
  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
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
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users for individual selection");
    }
  };
  useEffect(() => { 
    fetchAnnouncements(); 
    fetchUsers();
  }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.patch(`/admin/announcements/${editingId}`, form);
        setList(list.map(a => a.announcement_id === editingId ? res.data : a));
        showToast('success', 'Announcement updated successfully!');
      } else {
        const res = await api.post('/admin/announcements', form);
        setList([res.data || { ...form, announcement_id: Date.now().toString(), created_at: new Date().toISOString() }, ...list]);
        showToast('success', 'Announcement published successfully!');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast('error', 'Communication failure. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = (a) => {
    setForm({
      title: a.title,
      body: a.body,
      category: a.category,
      target_role: a.target_role || 'all',
      target_user_id: a.target_user_id || '',
      expiry_date: a.expiry_date ? a.expiry_date.split('T')[0] : '',
      is_pinned: a.is_pinned,
      send_email: false
    });
    setEditingId(a.announcement_id);
    setShowModal(true);
  };
  const resetForm = () => {
    setForm({ 
      title: '', body: '', category: 'Academic', 
      target_role: 'all', target_user_id: '', expiry_date: '', 
      is_pinned: false, send_email: false 
    });
    setEditingId(null);
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/announcements/${confirmDelete}`);
      setList(list.filter(a => a.announcement_id !== confirmDelete));
      if (selectedAnnouncement?.announcement_id === confirmDelete) setSelectedAnnouncement(null);
      setConfirmDelete(null);
      showToast('success', 'Announcement retracted successfully.');
    } catch (err) {
      showToast('error', 'Failed to delete announcement.');
    }
  };
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
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
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4 lg:mt-0 active:scale-95"
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
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
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
                <div className="flex items-center gap-2 shrink-0">
                  {a.is_pinned && (
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-lg shadow-sm border border-amber-200">
                      <Pin size={16} className="fill-current" />
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(a);
                    }}
                    className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-100 shadow-sm"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(a.announcement_id);
                    }}
                    className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Modify Bulletin' : 'Launch Broadcast'}</h2>
                  <p className="text-slate-500 text-[12px] font-bold uppercase tracking-widest">Global Communication Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[80vh] scrollbar-hide">
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Title Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Header</label>
                  <input 
                    required 
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief, descriptive title..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all placeholder:text-slate-300"
                  />
                </div>
                {/* Category & Target Audience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Tag size={12} /> Category
                    </label>
                    <select 
                      value={form.category} 
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Users size={12} /> Audience
                    </label>
                    <select 
                      value={form.target_role} 
                      onChange={e => setForm({ ...form, target_role: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all appearance-none cursor-pointer capitalize"
                    >
                      {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                {/* Individual Recipient Search (if selected) */}
                {form.target_role === 'individual' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <User size={12} /> Select Recipient
                    </label>
                    <select 
                      value={form.target_user_id} 
                      onChange={e => setForm({ ...form, target_user_id: e.target.value })}
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Search and select a user...</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Body Content */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                  <textarea 
                    required 
                    rows={5} 
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    placeholder="Provide full details of the announcement..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all resize-none placeholder:text-slate-300 min-h-[160px]"
                  />
                </div>
                {/* Date & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Calendar size={12} /> Expiry Date
                    </label>
                    <input 
                      type="date" 
                      value={form.expiry_date}
                      onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-0 select-none ml-1">Pin</label>
                    <div className="flex items-center gap-4 px-5 bg-amber-50 rounded-2xl border border-amber-100/50 h-[58px]">
                      <div className="flex items-center gap-4 flex-1">
                        <input 
                          type="checkbox" 
                          checked={form.is_pinned}
                          onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                          className="w-5 h-5 text-amber-500 rounded-lg focus:ring-amber-400 border-amber-200 cursor-pointer"
                        />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-700 leading-none mb-1">Priority Pin</span>
                           <span className="text-[9px] font-bold text-amber-600/70 leading-none">Stick to top of feed</span>
                        </div>
                      </div>
                      <Pin size={16} className={`${form.is_pinned ? 'text-amber-500' : 'text-amber-200'} transition-colors`} />
                    </div>
                  </div>
                </div>
                {/* Email Broadcast Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-4 px-5 py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 transition-all hover:bg-indigo-50 cursor-pointer">
                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                      <Mail size={18} />
                    </div>
                    <div className="flex flex-col flex-1">
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-700 leading-none mb-1.5">Email Notification</span>
                       <span className="text-[11px] font-bold text-slate-500">Dispatch a copy to recipient mailboxes via SMTP</span>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={form.send_email}
                        onChange={e => setForm({ ...form, send_email: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                </div>
                {/* Footer Actions */}
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting...' : editingId ? 'Save Modifications' : 'Publish Bulletin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 lg:p-12 transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col relative">
            {/* Modal Header/Banner */}
            <div className={`p-10 lg:p-14 text-slate-900 bg-slate-50 border-b border-slate-100 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <button 
                onClick={() => setSelectedAnnouncement(null)} 
                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 transition-all z-20"
              >
                <X size={20} />
              </button>
              <div className="relative z-10 space-y-4 pr-12 lg:pr-0">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${categoryStyles[selectedAnnouncement.category]}`}>
                    {selectedAnnouncement.category}
                  </span>
                  {selectedAnnouncement.is_pinned && (
                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-[0.2em]">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black brand-font leading-tight tracking-tight text-slate-900">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                      <Target size={14} className="text-indigo-500" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest">{selectedAnnouncement.target_role} Audience</p>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                      <Calendar size={14} className="text-indigo-500" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest">{new Date(selectedAnnouncement.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Body */}
            <div className="p-10 lg:p-14 overflow-y-auto max-h-[50vh] bg-white scrollbar-hide">
              <div className="prose prose-slate max-w-none">
                <p className="text-base lg:text-[17px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedAnnouncement.body}
                </p>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-indigo-400 overflow-hidden">
                      <User size={14} />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Propagation Active</p>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200 border border-slate-200">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-100 translate-y-1">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Delete Announcement?</h3>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed px-4">
                  Are you sure you want to delete this? This action cannot be undone and it will be removed for everyone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[300] animate-in fade-in slide-in-from-right-8 duration-500">
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
              <p className="text-[14px] font-bold tracking-tight">
                {toast.msg}
              </p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full overflow-hidden w-full">
              <div className="h-full bg-white animate-progress" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Announcements;
