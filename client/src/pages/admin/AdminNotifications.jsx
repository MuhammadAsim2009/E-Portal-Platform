import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Bell, Info, AlertTriangle, ShieldCheck, 
  Activity, Clock, Search, Filter, Trash2, 
  ChevronRight, ArrowUpRight, History, Settings,
  User, Database, CreditCard, BookOpen
} from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread', 'all'
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const isRead = activeTab === 'unread' ? 'false' : undefined;
      const res = await api.get(`/admin/notifications?limit=100${isRead ? `&isRead=${isRead}` : ''}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback for UI testing
      setNotifications([
        { notification_id: '1', title: 'New Registration', message: 'Muhammad Asim has registered as a Student and is waiting for approval.', type: 'registration', is_read: false, created_at: new Date().toISOString(), user_name: 'Muhammad Asim', priority: 'high' },
        { notification_id: '2', title: 'Payment Request', message: 'Sarah Khan submitted a payment slip for Course Fee (PKR 15,000).', type: 'payment', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Sarah Khan', priority: 'high' },
        { notification_id: '3', title: 'Course Enrollment', message: 'John Doe enrolled in CS-201 Section A.', type: 'enrollment', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'John Doe', priority: 'medium' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      if (activeTab === 'unread') {
        setNotifications(prev => prev.filter(n => n.notification_id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'registration': return <User size={18} />;
      case 'payment': return <CreditCard size={18} />;
      case 'enrollment': return <BookOpen size={18} />;
      case 'message': return <Bell size={18} />;
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
            <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <Bell size={24} className="animate-pulse" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
               <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest leading-none">Portal activity & alerts</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={fetchNotifications}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <History size={16} /> Refresh Feed
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search alerts by student name or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-slate-900/5 rounded-xl text-[13px] font-bold transition-all focus:bg-white"
          />
        </div>
        <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['unread', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
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
            <div key={i} className="bg-white border border-slate-100 rounded-[1.5rem] p-6 animate-pulse space-y-4">
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
            <p className="text-slate-400 text-sm mt-2">No active alerts requiring attention.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div 
              key={item.notification_id} 
              className={`bg-white border rounded-[2rem] p-6 transition-all duration-300 group relative overflow-hidden ${
                item.is_read ? 'border-slate-100 opacity-80' : 'border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
              }`}
            >
              {!item.is_read && (
                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                  <button 
                    onClick={() => handleMarkAsRead(item.notification_id)}
                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 px-4"
                  >
                    <ShieldCheck size={14} /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Mark as Handled</span>
                  </button>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${getPriorityStyles(item.priority)} shadow-sm`}>
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        item.type === 'registration' ? 'bg-indigo-600 text-white' : 
                        item.type === 'payment' ? 'bg-emerald-600 text-white' : 
                        'bg-slate-900 text-white'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
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
                  
                  <h3 className="text-slate-900 font-black text-lg tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-500 font-bold tracking-tight text-[15px] leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                    <span className="text-[12px] font-black text-slate-900">{item.user_name || 'System'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full mx-1"></span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Source: {item.user_role || 'System Agent'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Info */}
      {!loading && notifications.length > 0 && (
         <div className="flex items-center justify-center py-6 border-t border-slate-100">
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} /> End of portal notification feed
            </p>
         </div>
      )}
    </div>
  );
};

export default AdminNotifications;
