import { useState, useEffect } from 'react'; 
import { 
  Search, Filter, Mail, Clock, CheckCircle2, 
  Reply, Trash2, Send, Loader2, MessageSquare, 
  ExternalLink, User, Building, FileText,
  CheckCircle, 
  MoreVertical,
  Check,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';

export default function Messages() {
  usePageTitle('Inquiries & Messages');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read, replied

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      setMessages(res.data);
      if (res.data.length > 0 && !selectedMessage) {
        setSelectedMessage(res.data[0]);
        if (res.data[0].status === 'unread') {
          markAsRead(res.data[0].message_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMessages(prev => prev.map(m => m.message_id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      markAsRead(msg.message_id);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await api.post(`/admin/messages/${selectedMessage.message_id}/reply`, {
        reply: replyText
      });
      
      setMessages(prev => prev.map(m => m.message_id === selectedMessage.message_id ? res.data.data : m));
      setSelectedMessage(res.data.data);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && m.status === filter;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Inquiries" 
          count={messages.length} 
          icon={<Mail size={18} />} 
          color="text-blue-600 bg-blue-50 dark:bg-blue-500/10" 
        />
        <StatCard 
          title="Unread" 
          count={messages.filter(m => m.status === 'unread').length} 
          icon={<MessageSquare size={18} />} 
          color="text-rose-600 bg-rose-50 dark:bg-rose-500/10" 
        />
        <StatCard 
          title="Replied" 
          count={messages.filter(m => m.status === 'replied').length} 
          icon={<CheckCircle size={18} />} 
          color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <StatCard 
          title="Response Rate" 
          count={messages.length > 0 ? Math.round((messages.filter(m => m.status === 'replied').length / messages.length) * 100) + '%' : '0%'} 
          icon={<RotateCcw size={18} />} 
          color="text-violet-600 bg-violet-50 dark:bg-violet-500/10" 
        />
      </div>

      <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
        
        {/* Left: Message List */}
        <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-white/10">
          <div className="p-4 space-y-4 border-b border-slate-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['all', 'unread', 'read', 'replied'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <p className="text-sm text-slate-500">Syncing messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                <Mail size={40} className="mb-4 text-slate-300" />
                <p className="text-sm font-medium">No messages found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search</p>
              </div>
            ) : (
              filteredMessages.map(m => (
                <button
                  key={m.message_id}
                  onClick={() => handleSelectMessage(m)}
                  className={`w-full p-4 text-left border-b border-slate-200 dark:border-white/10 transition-all hover:bg-slate-50 dark:hover:bg-white/5 relative ${
                    selectedMessage?.message_id === m.message_id ? 'bg-blue-50/50 dark:bg-blue-500/5 ring-1 ring-inset ring-blue-500/20' : ''
                  }`}
                >
                  {m.status === 'unread' && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-4">{m.name}</span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{format(new Date(m.created_at), 'MMM dd')}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mb-1">{m.subject || 'No Subject'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{m.message}</p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    {m.institution && (
                      <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <Building size={10} /> {m.institution}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Detail */}
        <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-transparent">
          {selectedMessage ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedMessage.subject || 'General Inquiry'}</h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><User size={14} /> {selectedMessage.name}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedMessage.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2 max-w-2xl">
                    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/10 shadow-sm">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                      {selectedMessage.institution && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
                          <Building size={12} /> Institution: {selectedMessage.institution}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 ml-1">{format(new Date(selectedMessage.created_at), 'MMMM dd, yyyy · hh:mm a')}</span>
                  </div>
                </div>

                {/* Admin Reply */}
                {selectedMessage.reply_text && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-2 max-w-2xl text-right">
                      <div className="bg-emerald-50 dark:bg-emerald-500/5 p-4 rounded-2xl rounded-tr-none border border-emerald-100 dark:border-emerald-500/20 shadow-sm text-left">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                          <Check size={12} /> Admin Reply Sent
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {selectedMessage.reply_text}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 mr-1">{format(new Date(selectedMessage.replied_at), 'MMMM dd, yyyy · hh:mm a')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Area */}
              <div className="p-6 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10">
                <div className="relative group">
                  <textarea
                    rows={4}
                    placeholder={`Reply to ${selectedMessage.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 opacity-0 group-focus-within:opacity-100 transition-opacity">Press Enter to send</span>
                    <button 
                      onClick={handleReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="h-10 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {sendingReply ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Message Selected</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-2">Select a message from the sidebar to view details and send a reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon, color }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{count}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    unread: { text: 'Unread', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
    read: { text: 'Read', classes: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400' },
    replied: { text: 'Replied', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  };

  const config = configs[status] || configs.read;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.classes}`}>
      {config.text}
    </span>
  );
}
