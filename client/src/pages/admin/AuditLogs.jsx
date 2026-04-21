import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FileText, Search, Filter, ArrowLeft, Download, 
  Shield, AlertTriangle, Info, Clock, User as UserIcon,
  ChevronLeft, ChevronRight, RefreshCw, Calendar, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/audit-logs`, {
        params: { page, limit: 20 }
      });
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      // Fetch ALL logs by using a very high limit or the total count
      const response = await api.get(`/admin/audit-logs`, {
        params: { page: 1, limit: total || 10000 }
      });
      
      const allLogs = response.data.logs;
      if (!allLogs || allLogs.length === 0) return;
      
      const headers = ['Timestamp', 'Actor ID', 'Actor Name', 'Action', 'Entity Type', 'Description', 'Severity', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...allLogs.map(log => [
          `"${new Date(log.created_at || Date.now()).toLocaleString()}"`,
          `"${log.user_id || 'N/A'}"`,
          `"${log.user_name || 'System'}"`,
          `"${log.action || 'Unknown'}"`,
          `"${log.target || 'N/A'}"`,
          `"${(log.details || '').replace(/"/g, '""')}"`,
          `"${log.severity || 'info'}"`,
          `"${log.ip_address || '0.0.0.0'}"`
        ].join(','))
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <Shield className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
      const matchesSearch = 
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || log.severity?.toLowerCase() === severityFilter.toLowerCase();
      
      return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight brand-font">Audit logs</h1>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-md text-sm">Comprehensive trace of all administrative and system-level operations within the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={`text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
            Sync Records
          </button>
          <button 
            onClick={exportToCSV}
            disabled={isExporting || total === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? 'Generating...' : 'Export logs'}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* Filters Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search logs by user, action or details..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4" />
            Showing last {logs.length} entries of {total}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8 h-16 bg-slate-50/20"></td>
                    </tr>
                   ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                             <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-500 font-medium">No system logs found matching your criteria</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                             {log.user_name?.[0] || 'S'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{log.user_name || 'System'}</span>
                            <span className="text-[11px] text-slate-500 tracking-tight font-medium uppercase font-mono">{log.user_role || 'CORE'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                            {log.action}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 line-clamp-1 max-w-[400px]" title={log.details}>
                          {log.details}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border ${getSeverityColor(log.severity)} uppercase tracking-wider px-3`}>
                          {getSeverityIcon(log.severity)}
                          {log.severity || 'info'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                         <span className="text-[11px] font-mono p-1 bg-slate-900 text-slate-400 rounded-md">
                           {log.ip_address || '127.0.0.1'}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                Page <span className="text-slate-900">{page}</span> of {Math.ceil(total / 20)}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
