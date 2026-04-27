import { useState, useEffect } from 'react';
import { 
  X, User, GraduationCap, Calendar, CreditCard, 
  CheckCircle2, AlertCircle, Clock, BookOpen, 
  Phone, Mail, Hash, CalendarDays, MapPin, 
  BarChart3, FileText, Download, ExternalLink
} from 'lucide-react';
import api from '../../services/api';

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-4 border-b-2 transition-all font-bold text-sm tracking-tight ${
      active 
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value || 'N/A'}</p>
    </div>
  </div>
);

const StudentDetailsModal = ({ studentId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bio');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/students/${studentId}/details`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchDetails();
  }, [studentId]);

  const handleExport = () => {
    if (!data) return;
    const { studentInfo, enrolled, attendance, fees } = data;
    const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.net_amount || 0), 0);
    const totalDue  = fees.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.net_amount || 0), 0);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Student Report - ${studentInfo.full_name}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:13px}h1{font-size:22px;margin-bottom:4px}h2{font-size:15px;margin:24px 0 8px;border-bottom:2px solid #6366f1;padding-bottom:4px;color:#6366f1}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#f8fafc;text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}td{padding:8px 12px;border-bottom:1px solid #f1f5f9}.badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700}.paid{background:#d1fae5;color:#065f46}.pending{background:#fef3c7;color:#92400e}.header-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.meta{color:#64748b;font-size:12px}@media print{body{padding:16px}}</style></head>
<body>
<h1>${studentInfo.full_name}</h1>
<p class="meta">${studentInfo.email} &nbsp;|&nbsp; ID: ${studentInfo.student_id} &nbsp;|&nbsp; Status: ${studentInfo.account_status}</p>
<div class="header-grid">
  <div><p><b>Gender:</b> ${studentInfo.gender || 'N/A'}</p><p><b>CNIC:</b> ${studentInfo.cnic || 'N/A'}</p><p><b>Phone:</b> ${studentInfo.contact_number || 'N/A'}</p></div>
  <div><p><b>GPA:</b> ${studentInfo.gpa || 'N/A'}</p><p><b>Batch:</b> ${studentInfo.batch || 'N/A'}</p><p><b>DOB:</b> ${studentInfo.date_of_birth ? new Date(studentInfo.date_of_birth).toLocaleDateString() : 'N/A'}</p></div>
</div>
<h2>Enrolled Courses</h2>
<table><thead><tr><th>Course</th><th>Code</th><th>Credits</th><th>Instructor</th><th>Grade</th><th>Status</th></tr></thead><tbody>
${enrolled.map(e => `<tr><td>${e.title}</td><td>${e.course_code}</td><td>${e.credit_hours} CH</td><td>${e.instructor_name || 'N/A'}</td><td>${e.grade || '—'}</td><td><span class="badge ${e.status}">${e.status}</span></td></tr>`).join('')}
</tbody></table>
<h2>Attendance Summary</h2>
<table><thead><tr><th>Course</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th><th>%</th></tr></thead><tbody>
${attendance.map(a => `<tr><td>${a.course_title} (${a.course_code})</td><td>${a.present_count}</td><td>${a.absent_count}</td><td>${a.late_count}</td><td>${a.total_days}</td><td>${a.percentage}%</td></tr>`).join('')}
</tbody></table>
<h2>Fee Summary</h2>
<p><b>Total Paid:</b> PKR ${totalPaid.toLocaleString()} &nbsp;|&nbsp; <b>Outstanding:</b> PKR ${totalDue.toLocaleString()}</p>
<table><thead><tr><th>Fee Type</th><th>Due Date</th><th>Amount</th><th>Discount</th><th>Status</th></tr></thead><tbody>
${fees.map(f => `<tr><td>${f.fee_type}</td><td>${new Date(f.due_date).toLocaleDateString()}</td><td>PKR ${parseFloat(f.amount).toLocaleString()}</td><td>PKR ${parseFloat(f.discount_amount||0).toLocaleString()}</td><td><span class="badge ${f.status}">${f.status}</span></td></tr>`).join('')}
</tbody></table>
<p style="margin-top:32px;color:#94a3b8;font-size:11px">Generated on ${new Date().toLocaleString()} &mdash; E-Portal Platform</p>
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20">
                {data?.studentInfo?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${data?.studentInfo?.account_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {data?.studentInfo?.full_name}
                <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">Student Profile</span>
              </h2>
              <div className="flex flex-col gap-1 mt-1.5">
                <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5 max-w-sm truncate">
                  <Mail size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate" title={data?.studentInfo?.email}>{data?.studentInfo?.email}</span>
                </p>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                  <Hash size={14} className="shrink-0 text-slate-400" /> {data?.studentInfo?.student_id}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-10 bg-white border-b border-slate-100 flex items-center gap-2 shrink-0">
          <TabButton active={activeTab === 'bio'} onClick={() => setActiveTab('bio')} icon={User} label="Bio Data" />
          <TabButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')} icon={GraduationCap} label="Academic" />
          <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={Calendar} label="Attendance" />
          <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={CreditCard} label="Financials" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide bg-slate-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-bold text-sm animate-pulse">Fetching Comprehensive Records...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-2">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Failed to Load Records</h3>
              <p className="text-slate-500 max-w-sm">{error}</p>
              <button onClick={onClose} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all">Go Back</button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* BIO DATA TAB */}
              {activeTab === 'bio' && (
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-2">
                    <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                      <User size={18} className="text-indigo-600" /> Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailRow label="Full Name" value={data.studentInfo.full_name} icon={User} />
                      <DetailRow label="Gender" value={data.studentInfo.gender} icon={User} />
                      <DetailRow label="Date of Birth" value={data.studentInfo.date_of_birth ? new Date(data.studentInfo.date_of_birth).toLocaleDateString() : 'N/A'} icon={CalendarDays} />
                      <DetailRow label="CNIC / ID" value={data.studentInfo.cnic} icon={Hash} />
                    </div>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-2">
                    <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Phone size={18} className="text-indigo-600" /> Contact & Account
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailRow label="Email Address" value={data.studentInfo.email} icon={Mail} />
                      <DetailRow label="Phone Number" value={data.studentInfo.contact_number} icon={Phone} />
                      <DetailRow label="Current Status" value={data.studentInfo.account_status} icon={CheckCircle2} />
                      <DetailRow label="Student ID" value={data.studentInfo.student_id} icon={Hash} />
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMIC TAB */}
              {activeTab === 'academic' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current GPA</p>
                      <p className="text-3xl font-black text-slate-900">{data.studentInfo.gpa || '0.00'}</p>
                      <div className="mt-4 flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                        <BarChart3 size={12} /> Top 15%
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Course</p>
                      <p className="text-lg font-black text-slate-900">{data.enrolled?.[0]?.course_code || data.studentInfo.program || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Section</p>
                      <p className="text-lg font-black text-slate-900">{data.enrolled?.[0]?.section_name || data.studentInfo.semester || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Courses</p>
                      <p className="text-lg font-black text-slate-900">{data.enrolled?.length || 0} Registered</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-indigo-600" /> Enrollment History
                      </h4>
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-50/50">
                        <tr>
                          {['Course', 'Credits', 'Instructor', 'Schedule', 'Grade', 'Status'].map(h => (
                            <th key={h} className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.enrolled.map((e, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4">
                              <p className="font-bold text-slate-900 text-sm">{e.title}</p>
                              <p className="text-[10px] text-indigo-500 font-bold tracking-wider">{e.course_code}</p>
                            </td>
                            <td className="px-8 py-4 text-xs font-bold text-slate-500">{e.credit_hours} CH</td>
                            <td className="px-8 py-4 text-xs font-bold text-slate-500">{e.instructor_name}</td>
                            <td className="px-8 py-4">
                              <p className="text-xs font-bold text-slate-700">{e.day_of_week}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{e.start_time} - {e.end_time}</p>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${e.grade ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                {e.grade || '—'}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                e.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {e.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeTab === 'attendance' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.attendance.map((a, i) => (
                      <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform ${a.percentage > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{a.course_code}</p>
                        <h5 className="font-bold text-slate-900 text-sm mb-4 truncate pr-10">{a.course_title}</h5>
                        
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-3xl font-black text-slate-900">{a.percentage}%</p>
                            <p className="text-[10px] font-bold text-slate-400">Attendance Rate</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-700">{a.present_count}/{a.total_days}</p>
                            <p className="text-[10px] font-bold text-slate-400">Present Days</p>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${a.percentage > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${a.percentage}%` }}
                          />
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="bg-rose-50 px-3 py-2 rounded-xl border border-rose-100/50">
                            <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Absent</p>
                            <p className="text-sm font-black text-rose-600">{a.absent_count}</p>
                          </div>
                          <div className="bg-amber-50 px-3 py-2 rounded-xl border border-amber-100/50">
                            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Late</p>
                            <p className="text-sm font-black text-amber-600">{a.late_count}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {data.attendance.length === 0 && (
                    <div className="bg-white rounded-[2.5rem] p-20 border border-slate-200 border-dashed text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Calendar size={40} />
                      </div>
                      <p className="text-slate-900 font-bold">No Attendance Records</p>
                      <p className="text-slate-400 text-sm">Attendance marking has not started for this student.</p>
                    </div>
                  )}
                </div>
              )}

              {/* FINANCIALS TAB */}
              {activeTab === 'financials' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-indigo-500/10 rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Balance</p>
                      <h5 className="text-3xl font-black text-slate-900">
                        PKR {data.fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.net_amount), 0).toLocaleString()}
                      </h5>
                      <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1.5">
                        <AlertCircle size={14} /> Outstanding Dues
                      </p>
                    </div>
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Paid</p>
                      <h5 className="text-3xl font-black text-emerald-600">
                        PKR {data.fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.net_amount), 0).toLocaleString()}
                      </h5>
                    </div>
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Fee Waivers</p>
                      <h5 className="text-3xl font-black text-indigo-600">
                        PKR {data.fees.reduce((sum, f) => sum + (parseFloat(f.discount_amount) || 0), 0).toLocaleString()}
                      </h5>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" /> Invoice History
                      </h4>
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-50/50">
                        <tr>
                          {['Fee Type', 'Due Date', 'Amount', 'Discount', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.fees.map((f, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4">
                              <p className="font-bold text-slate-900 text-sm">{f.fee_type}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.semester}</p>
                            </td>
                            <td className="px-8 py-4 text-xs font-bold text-slate-500">
                              {new Date(f.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-4">
                              <p className="text-sm font-black text-slate-900">PKR {parseFloat(f.amount).toLocaleString()}</p>
                            </td>
                            <td className="px-8 py-4 text-xs font-bold text-indigo-600">
                              -PKR {parseFloat(f.discount_amount || 0).toLocaleString()}
                            </td>
                            <td className="px-8 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                f.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 
                                f.status === 'waived' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {f.status}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Last Updated: {new Date().toLocaleString()}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
            >
              Close Profile
            </button>
            <button 
              onClick={handleExport}
              disabled={!data}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} /> Print Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDetailsModal;
