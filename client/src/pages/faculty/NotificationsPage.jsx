import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Bell, Info, AlertTriangle, ShieldCheck, 
  Activity, Clock, Search, Filter, Trash2, 
  ChevronRight, ArrowUpRight, History, Settings,
  User, Database, CreditCard, BookOpen, AlertCircle, CheckCircle2, X
} from 'lucide-react';

const NotificationsPage = () => {
  usePageTitle('Faculty Notifications');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread', 'all'
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const isRead = activeTab === 'unread' ? 'false' : undefined;
      const res = await api.get(`/faculty/notifications?limit=100${isRead ? `&isRead=${isRead}` : ''}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/faculty/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      if (activeTab === 'unread') {
        setNotifications(prev => prev.filter(n => n.notification_id !== id));
      }
      showToast('success', 'Notification marked as read');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to update status');
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': 
      case 'urgent': return 'bg-rose-600 text-white shadow-lg shadow-rose-600/20';
      case 'medium': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20';
      case 'low': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20';
      default: return 'bg-amber-600 text-white shadow-lg shadow-amber-600/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return <Bell size={18} />;
      case 'assignment': return <BookOpen size={18} />;
      case 'evaluation': return <Activity size={18} />;
      case 'system': return <Settings size={18} />;
      default: return <Info size={18} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
      const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase()) || 
                          n.title.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
              <Bell size={20} />
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
               <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest leading-none ml-1">Stay updated with section activity</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={fetchNotifications}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              <History size={16} /> Refresh Feed
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search notifications by title or message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-[13px] font-bold transition-all focus:bg-white placeholder:text-slate-300"
          />
        </div>
        <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['unread', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === t 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-slate-100 rounded-full" />
                <div className="w-32 h-4 bg-slate-50 rounded-full" />
              </div>
              <div className="w-3/4 h-6 bg-slate-50 rounded-full" />
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-[3rem] border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Inbox Synchronized</h3>
            <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">No active alerts requiring attention.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div 
              key={item.notification_id} 
              className={`bg-white border rounded-[2.5rem] p-8 transition-all duration-500 group relative overflow-hidden ${
                item.is_read ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50'
              }`}
            >
              {!item.is_read && (
                <div className="absolute top-8 right-8">
                  <button 
                    onClick={() => handleMarkAsRead(item.notification_id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    <ShieldCheck size={14} /> 
                    <span>Mark Handled</span>
                  </button>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${getPriorityStyles(item.priority)} shadow-sm`}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        item.is_read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                        <Clock size={12} />
                        {new Date(item.created_at).toLocaleString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl lg:text-2xl tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 font-bold tracking-tight text-[15px] lg:text-[16px] leading-relaxed max-w-3xl">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                      S
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notification Source</span>
                      <span className="text-[12px] font-black text-slate-900">Automated System Alert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {!loading && notifications.length > 0 && (
         <div className="flex items-center justify-center py-10 border-t border-slate-50">
            <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity size={14} className="text-indigo-400" /> End of Notification Timeline
            </p>
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

export default NotificationsPage;
