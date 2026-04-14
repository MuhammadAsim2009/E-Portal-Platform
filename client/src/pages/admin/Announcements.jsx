import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Megaphone, Plus, X, Pin, AlertCircle, CheckCircle2 } from 'lucide-react';

const TARGET_ROLES = ['all', 'student', 'faculty', 'admin'];
const CATEGORIES = ['Academic', 'General', 'Exam', 'Event', 'Alert'];

const Announcements = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
        { announcement_id: '2', title: 'Library Extended Hours', body: 'The university library will remain open 24/7 during the exam week for all students.', category: 'General', target_role: 'all', is_pinned: false, created_at: new Date().toISOString() },
        { announcement_id: '3', title: 'Faculty Meeting — April 18th', body: 'All faculty members are required to attend the departmental review meeting on Friday, April 18th at 2:00 PM in Hall B.', category: 'Academic', target_role: 'faculty', is_pinned: false, created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/announcements', form);
      setList([res.data, ...list]);
      setShowModal(false);
      setForm({ title: '', body: '', category: 'Academic', target_role: 'all', expiry_date: '', is_pinned: false });
      showToast('success', 'Announcement published successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to publish.');
    } finally {
      setSubmitting(false);
    }
  };

  const targetBadge = {
    all: 'bg-slate-100 text-slate-600',
    student: 'bg-sky-50 text-sky-700',
    faculty: 'bg-violet-50 text-violet-700',
    admin: 'bg-amber-50 text-amber-700',
  };
  const categoryColor = {
    Exam: 'bg-red-50 text-red-700', Academic: 'bg-primary-50 text-primary-700',
    General: 'bg-slate-100 text-slate-600', Event: 'bg-emerald-50 text-emerald-700',
    Alert: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold border animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone size={22} className="text-primary-600" /> Announcements
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Publish and manage platform-wide communications.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Announcement List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded-full w-1/2" />
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-3 bg-slate-100 rounded-full w-3/4" />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
            <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">No announcements yet.</p>
          </div>
        ) : (
          list.map(a => (
            <div key={a.announcement_id} className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${a.is_pinned ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {a.is_pinned && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Pin size={10} /> Pinned
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColor[a.category] || 'bg-slate-100 text-slate-600'}`}>
                      {a.category}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${targetBadge[a.target_role]}`}>
                      → {a.target_role}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{a.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{a.body}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
                <input required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Exam schedule update…"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Body *</label>
                <textarea required rows={4} value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your announcement content here…"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Audience</label>
                  <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white transition-all capitalize">
                    {TARGET_ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date (optional)</label>
                <input type="date" value={form.expiry_date}
                  onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input type="checkbox" checked={form.is_pinned}
                  onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Pin size={13} className="text-amber-500" /> Pin this announcement to the top
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
