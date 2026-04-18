import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  LayoutDashboard,
  BookOpen, 
  Book,
  Users,
  Calendar, 
  CreditCard,
  AlertCircle,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign,
  FileText,
  User,
  Plus,
  Trash2,
  RefreshCw,
  MoreVertical,
  Mail,
  Smartphone,
  Megaphone,
  Pin,
  X

} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, Toaster } from 'react-hot-toast';

// --- Sub-components ---

const DashboardCard = ({ title, value, icon, color = "blue", subtitle }) => (
  <div className="glass-card p-6 rounded-2xl animate-in fade-in zoom-in duration-500">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
      {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
    </div>
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const AttendanceGauge = ({ percentage, course }) => {
  const getColor = (p) => {
    if (p >= 85) return 'text-emerald-500';
    if (p >= 75) return 'text-amber-500';
    return 'text-rose-500';
  }
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm ${getColor(percentage)} border-current bg-white shadow-sm`}>
          {percentage}%
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-slate-700">{course}</h4>
          <p className="text-xs text-slate-500">{percentage < 75 ? 'Attendance Risk' : 'Good Standing'}</p>
        </div>
      </div>
      <div className={`h-2 w-2 rounded-full ${percentage < 75 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
    </div>
  );
};

// --- Main Component ---

const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['explore', 'courses', 'assignments', 'academic', 'finance'].includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('overview');
    }
  }, [location]);


  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/student/dashboard');
    } else {
      navigate(`/student/${tab}`);
    }
  };

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to your new dynamic dashboard!", time: "Just now", type: 'info' }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Flows State
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [conflictError, setConflictError] = useState(null);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, courseRes, announceRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/courses/available'),
        api.get('/student/announcements')
      ]);
      setDashboardData(dashRes.data);
      setAvailableCourses(courseRes.data);
      setAnnouncements(announceRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (course) => {
    setConflictError(null);
    try {
      const res = await api.post('/student/enroll', { sectionId: course.section_id });
      toast.success(res.data.message || 'Successfully enrolled!');
      fetchData(); // Refresh data
    } catch (err) {
      setConflictError(err.response?.data?.message || 'Enrollment failed');
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleDrop = async (course) => {
    if (!window.confirm(`Are you sure you want to drop ${course.course_code}?`)) return;
    try {
      const res = await api.post('/student/drop', { sectionId: course.section_id });
      toast.success(res.data.message || 'Successfully dropped module');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop course');
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!submissionFile || !showSubmissionModal) return;
    
    const formData = new FormData();
    formData.append('file', submissionFile);
    formData.append('assignmentId', showSubmissionModal.assignment_id);

    try {
      const res = await api.post('/student/assignments/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(res.data.message || 'Assignment submitted successfully!');
      setShowSubmissionModal(null);
      setSubmissionFile(null);
      fetchData(); // Refresh data to update status to "Submitted"
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    }
  };


  const handleDownloadTimetable = () => {
    const doc = new jsPDF();
    const student = dashboardData?.studentInfo;
    const enrolled = dashboardData?.enrolled || [];
    
    // Header Styling
    doc.setFillColor(99, 102, 241); // Indigo 500
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIC TIMETABLE', 14, 25);
    
    doc.setFontSize(10);
    doc.text('E-PORTAL STUDENT MANAGEMENT SYSTEM', 14, 33);
    
    // Student Info Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('STUDENT INFORMATION', 14, 55);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${student?.full_name || student?.name || 'N/A'}`, 14, 63);
    doc.text(`Student ID: ${student?.student_id || 'N/A'}`, 14, 68);
    doc.text(`Program: ${student?.program || 'N/A'}`, 14, 73);
    doc.text(`Semester: ${student?.semester || 'N/A'}`, 14, 78);
    
    doc.text(`Issued On: ${new Date().toLocaleDateString()}`, 140, 63);
    doc.text(`Status: Active Enrollment`, 140, 68);

    // Sorting Logic for Schedule
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sortedEnrolled = [...enrolled].sort((a, b) => {
      const dayA = daysOrder.findIndex(d => a.schedule_time?.includes(d));
      const dayB = daysOrder.findIndex(d => b.schedule_time?.includes(d));
      if (dayA !== dayB) return dayA - dayB;
      return (a.schedule_time || '').localeCompare(b.schedule_time || '');
    });

    const tableData = sortedEnrolled.map(course => [
      course.course_code,
      course.title,
      course.schedule_time || 'Not Scheduled',
      course.room || 'TBD',
      `${course.credit_hours}.0`
    ]);

    autoTable(doc, {
      head: [['CODE', 'COURSE TITLE', 'SCHEDULE (DAY/TIME)', 'VENUE', 'CREDITS']],
      body: tableData,
      startY: 85,
      theme: 'grid',
      headStyles: { 
        fillColor: [99, 102, 241], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        cellPadding: 6
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'center', cellWidth: 25 },
        2: { halign: 'left' },
        3: { halign: 'center' },
        4: { halign: 'center', cellWidth: 20 }
      },
      margin: { top: 85 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        'This is a digitally generated document. No signature is required.',
        105,
        285,
        { align: 'center' }
      );
      doc.text(`Page ${i} of ${pageCount}`, 200, 285, { align: 'right' });
    }

    doc.save(`Timetable_${student?.student_id || 'Student'}.pdf`);
    toast.success('Timetable generated successfully!');
  };

  const handleDownloadReceipt = (fee) => {
    const doc = new jsPDF();
    const student = dashboardData?.studentInfo;
    
    // Header styling
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('PAYMENT RECEIPT', 14, 25);
    
    doc.setFontSize(10);
    doc.text('OFFICIAL ACADEMIC FEE CLEARANCE', 14, 33);
    
    // Receipt Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TRANSACTION SUMMARY', 14, 55);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Receipt No: RCT-${fee.fee_id}-${Date.now().toString().slice(-4)}`, 14, 63);
    doc.text(`Semester: ${fee.semester}`, 14, 68);
    doc.text(`Fee Type: ${fee.fee_type || 'Tuition Fee'}`, 14, 73);
    doc.text(`Status: FULLY SETTLED`, 14, 78);
    
    doc.text(`Student Name: ${student?.full_name || student?.name || 'N/A'}`, 120, 63);
    doc.text(`Student ID: ${student?.student_id || 'N/A'}`, 120, 68);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 120, 73);

    const tableBody = [
      ['Gross Amount', `$${parseFloat(fee.amount).toLocaleString()}`],
      ['Scholarship / Financial Aid', `-$${parseFloat(fee.discount_amount || 0).toLocaleString()}`],
      ['Late Payment Penalty', '$0.00'],
      ['Tax / Service Charges', 'Included']
    ];

    autoTable(doc, {
      head: [['DESCRIPTION', 'AMOUNT (USD)']],
      body: tableBody,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' }
      },
      foot: [['NET TOTAL PAID', `$${parseFloat(fee.net_amount).toLocaleString()}`]],
      footStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 12, fontStyle: 'bold', halign: 'right' }
    });

    // Seal Placeholder
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.circle(170, 200, 20, 'S');
    doc.setFontSize(8);
    doc.text('PAID', 170, 200, { align: 'center' });
    doc.text('VERIFIED', 170, 205, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Thank you for your prompt payment. This generated document serves as an official proof of clearance.', 14, 280);
    
    doc.save(`Receipt_${fee.semester}_${student?.student_id}.pdf`);
    toast.success('Payment receipt generated!');
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Synchronizing Student Records...</p>
      </div>
    );
  }

  const { studentInfo, enrolled, assignments, attendance, fees, unpaidFees, trendData } = dashboardData;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10 relative">
      <Toaster position="top-right" />
      
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl premium-shadow border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit Assignment</h3>
            <p className="text-slate-500 mb-6 font-medium">{showSubmissionModal.title} ({showSubmissionModal.course_code})</p>
            
            <form onSubmit={handleSubmission} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all group relative cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  required
                />
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <p className="font-bold text-slate-700">
                    {submissionFile ? submissionFile.name : 'Click or drag files to upload'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">PDF, DOCX, ZIP (Max 25MB)</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setShowSubmissionModal(null); setSubmissionFile(null); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Welcome back, <span className="gradient-text uppercase">{studentInfo.full_name || studentInfo.name || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your studies today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all relative"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl z-50 overflow-hidden premium-shadow">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                  <h4 className="font-bold text-slate-800">Notifications</h4>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white/50 backdrop-blur-xl">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-white/80 transition-colors border-b border-slate-100 last:border-0">
                      <div className="flex gap-3">
                         <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                         <div>
                            <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-bold">
                              <Clock size={10} /> {n.time}
                            </span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-bold text-slate-800">Registration Status</span>
            <span className="text-xs text-emerald-600 font-bold uppercase">Open for {studentInfo.semester}</span>
          </div>
        </div>
      </div>

      {/* Contextual Banner */}
      {unpaidFees > 0 && activeTab !== 'finance' && (
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4 duration-700 transition-all border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-rose-900 font-bold shrink-0 text-lg leading-tight">Fee Balance Outstanding</p>
              <p className="text-rose-700 text-sm font-medium">Your course registration for next semester will be blocked until dues are cleared.</p>
            </div>
          </div>
          <button 
            onClick={() => switchTab('finance')}
            className="hidden md:flex py-3 px-6 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all whitespace-nowrap shadow-lg shadow-rose-100 items-center gap-2"
          >
            Settle Balance <CreditCard size={18} />
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-8 min-h-[500px]">
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard 
                title="Current GPA" 
                value={studentInfo.gpa || 'N/A'} 
                icon={<TrendingUp size={24} />} 
                color="indigo" 
                subtitle={`Semester ${studentInfo.semester}`} 
              />
              <DashboardCard 
                title="Enrolled" 
                value={enrolled.length} 
                icon={<BookOpen size={24} />} 
                color="emerald" 
                subtitle={`${enrolled.reduce((sum, c) => sum + (c.credit_hours || 0), 0)} Credits`} 
              />
              <DashboardCard 
                title="Pending Tasks" 
                value={assignments.filter(a => a.status === 'Pending').length} 
                icon={<FileText size={24} />} 
                color="amber" 
                subtitle="Next 7 days" 
              />
              <DashboardCard 
                title="Fee Status" 
                value={`$${parseFloat(unpaidFees).toLocaleString()}`} 
                icon={<CreditCard size={24} />} 
                color="rose" 
                subtitle="Outstanding" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analytics: GPA Trend */}
              <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Academic Trajectory</h2>
                    <p className="text-slate-500 font-medium mt-1">GPA performance overview</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                      <TrendingUp size={14} /> Merit Standing
                    </span>
                  </div>
                </div>
                <div className="h-[320px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dy={15} />
                      <YAxis domain={[0, 4.0]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="gpa" 
                        stroke="#6366f1" 
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorGpa)"
                        dot={{ r: 7, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }}
                        activeDot={{ r: 9, fill: '#6366f1', stroke: '#fff', strokeWidth: 4 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance View */}
              <div className="glass-card p-10 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
                   <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={20} /></button>
                </div>
                <div className="space-y-5">
                  {attendance.length > 0 ? attendance.map((item, idx) => (
                    <AttendanceGauge key={idx} percentage={item.percentage} course={item.course} />
                  )) : (
                    <p className="text-slate-400 text-center py-10 italic">No attendance records yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Upload Section */}
            <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                        <Upload size={22} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">Quick Assignment Upload</h2>
                        <p className="text-slate-500 font-medium">Submit your work directly from here</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('assignments')}
                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:gap-3 transition-all bg-amber-50 px-5 py-2.5 rounded-xl hover:bg-amber-100"
                  >
                    All Assignments <ChevronRight size={16} />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {assignments.filter(a => a.status === 'Pending').slice(0, 3).length > 0 ? assignments.filter(a => a.status === 'Pending').slice(0, 3).map((a) => (
                    <div 
                      key={a.assignment_id}
                      className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-amber-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{a.title}</h4>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{a.course_code}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{new Date(a.deadline).toLocaleDateString()}</span>
                        <button 
                          onClick={() => setShowSubmissionModal(a)}
                          className="p-3 bg-white text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg shadow-amber-50 border border-slate-100"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-8 text-center text-slate-400 font-medium italic">
                      No pending assignments found.
                    </div>
                  )}
               </div>
            </div>

            {/* Recent Announcements Widget */}

            <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Megaphone size={22} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">Important Bulletins</h2>
                        <p className="text-slate-500 font-medium">Latest institutional updates</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => navigate('/student/announcements')}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all bg-indigo-50 px-5 py-2.5 rounded-xl hover:bg-indigo-100"
                  >
                    View All <ChevronRight size={16} />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {announcements.slice(0, 3).length > 0 ? announcements.slice(0, 3).map((a, idx) => (
                    <div 
                      key={a.announcement_id} 
                      onClick={() => navigate('/student/announcements')}
                      className="p-6 bg-slate-50 rounded-[2.25rem] border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          a.category === 'Exam' ? 'bg-rose-100 text-rose-600' : 
                          a.category === 'Alert' ? 'bg-amber-100 text-amber-600' : 
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {a.category}
                        </span>
                        {a.is_pinned && <Pin size={12} className="text-amber-500 fill-current" />}
                      </div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                        {a.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {a.body}
                      </p>
                    </div>
                  )) : (
                    <div className="col-span-full py-10 text-center text-slate-400 italic">No recent announcements</div>
                  )}
               </div>
            </div>
          </>
        )}

        {activeTab === 'explore' && (
          <div className="glass-card p-10 rounded-[2.5rem] animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 leading-tight">Explore Courses</h2>
                <p className="text-slate-500 font-medium mt-1">Discover new opportunities and register for upcoming modules.</p>
              </div>
            </div>

            {/* Conflict Display */}
            {conflictError && (
              <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-800 animate-in shake duration-500">
                <AlertCircle size={24} className="shrink-0" />
                <p className="font-bold">{conflictError}</p>
                <button onClick={() => setConflictError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X size={20} /></button>
              </div>
            )}

            {/* Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <div className="md:col-span-2 relative">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search course title, code or instructor..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-600">
                <option>All Departments</option>
              </select>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses
                .filter(c => 
                  c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  c.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (c.instructor_name && c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(course => {
                  const isEnrolled = enrolled.some(e => e.section_id === course.section_id);
                  const isFull = course.current_seats >= course.max_seats;
                  
                  return (
                    <div key={course.section_id} className={`p-8 bg-white border rounded-[2rem] transition-all flex flex-col justify-between group h-full shadow-sm hover:shadow-2xl ${isEnrolled ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-300'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-6">
                           <div className="space-y-1">
                              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.department}</span>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{course.course_code}</h3>
                           </div>
                           <div className="flex flex-col items-end">
                              <div className={`flex items-center gap-1 text-lg font-black ${isFull ? 'text-rose-500' : 'text-indigo-600'}`}>
                                <Users size={18} /> {course.max_seats - course.current_seats}
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                           </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-800 leading-snug mb-6 group-hover:text-indigo-600 transition-colors uppercase">{course.title}</h4>
                        <div className="space-y-4 mb-8">
                           <p className="text-sm font-bold text-slate-600 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={16} /></div>
                              {course.instructor_name || 'Staff'}
                           </p>
                           <p className="text-sm font-bold text-slate-500 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Clock size={16} /></div>
                              {course.schedule_time || 'TBD'}
                           </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => !isEnrolled && !isFull && handleEnroll(course)}
                        disabled={isEnrolled || isFull}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                          isEnrolled 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 cursor-default' 
                            : isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-50'
                        }`}
                      >
                        {isEnrolled ? 'Enrolled' : isFull ? 'Section Full' : 'Enroll Module'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- slide --- */}

        {activeTab === 'courses' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="glass-card p-10 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 leading-tight">My Courses</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage your active enrollments and academic schedule.</p>
                  </div>
                  <button 
                    onClick={handleDownloadTimetable}
                    className="flex items-center gap-2.5 py-4 px-8 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    <Download size={20} /> Export Timetable PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolled.map(course => (
                    <div key={course.section_id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-2xl transition-all group">
                       <div className="flex items-center justify-between mb-6">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Book size={24} />
                         </div>
                         <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-black text-slate-400 rounded-lg tracking-widest uppercase">
                            {course.credit_hours} Credits
                         </span>
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                       <p className="text-xs font-black text-indigo-600 mb-6 tracking-widest uppercase">{course.course_code}</p>
                       
                       <div className="space-y-4 pt-6 border-t border-slate-200/60">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                <User size={16} className="text-slate-500" />
                             </div>
                             <span className="text-sm font-bold text-slate-600">{course.instructor_name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500">
                             <Clock size={16} />
                             <span className="text-xs font-bold">{course.schedule_time || 'TBD'}</span>
                          </div>
                       </div>

                       <div className="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">Course Page</button>
                          <button 
                            onClick={() => handleDrop(course)}
                            className="p-3 bg-white text-rose-500 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-100 transition-all"
                            title="Drop Course"
                          >
                            <X size={18} />
                          </button>
                       </div>
                    </div>
                  ))}

                  {enrolled.length === 0 && (
                    <div className="col-span-full p-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                       <p className="text-slate-400 font-bold">You are not enrolled in any courses yet.</p>
                       <button 
                        onClick={() => setActiveTab('explore')}
                        className="mt-4 text-indigo-600 font-black uppercase text-xs tracking-widest underline"
                       >
                         Explore Modules Now
                       </button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}


        {activeTab === 'assignments' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
             <div className="glass-card p-10 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">Assignment Portal</h2>
                    <p className="text-slate-500 font-medium">Manage and upload your submissions. Track real-time feedback.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (assignments.length > 0) {
                        setShowSubmissionModal(assignments[0]);
                      } else {
                        toast.error("No assignments are currently available for submission.");
                      }
                    }}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 whitespace-nowrap"
                  >
                    <Upload size={20} /> Submit Assignment
                  </button>
                </div>


                <div className="space-y-5">
                  {assignments.length > 0 ? assignments.map(a => (
                    <div key={a.assignment_id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:-translate-y-1">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 shadow-indigo-50/50">
                          <FileText size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xl leading-tight">{a.title}</h4>
                            {a.status === 'Submitted' && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                <CheckCircle size={10} /> DONE
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{a.course_code} • Marks: {a.max_marks}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline</span>
                        <div className={`flex items-center gap-2 font-black text-lg ${new Date(a.deadline) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                           <Calendar size={20} /> {new Date(a.deadline).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowSubmissionModal(a)}
                          className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl ${
                            a.status === 'Submitted' 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-50'
                          }`}
                        >
                          <Upload size={20} /> {a.status === 'Submitted' ? 'Update Submission' : 'Upload Assignment'}
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                       <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                       <p className="text-slate-500 font-bold">No assignments found for your enrolled courses.</p>
                    </div>
                  )}
                </div>

             </div>

             {/* Graded Items */}
             <div className="glass-card p-10 rounded-[2.5rem]">
                <h2 className="text-2xl font-bold text-slate-800 mb-10">Submissions & Feedback</h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-bold text-slate-400 border-b border-slate-100 uppercase tracking-[0.2em]">
                        <th className="pb-6">ITEM DESCRIPTION</th>
                        <th className="pb-6">STATUS</th>
                        <th className="pb-6">MARK</th>
                        <th className="pb-6">INSTRUCTOR FEEDBACK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignments.filter(a => a.status === 'Submitted' || a.marks_obtained !== null).map(a => (
                        <tr key={a.assignment_id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-7">
                            <p className="font-bold text-slate-900 text-lg">{a.title}</p>
                            <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">{a.course_code}</p>
                          </td>
                          <td className="py-7">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest ${
                              a.marks_obtained !== null ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {a.marks_obtained !== null ? 'GRADED' : 'EVALUATING'}
                            </span>
                          </td>
                          <td className="py-7">
                             <div className="text-2xl font-black text-slate-900">{a.marks_obtained ?? '--'}<span className="text-slate-300 font-medium text-sm ml-1 select-none">/ {a.max_marks}</span></div>
                          </td>
                          <td className="py-7 max-w-xs">
                             <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{a.feedback || 'The instructor has not provided comments yet.'}"</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'academic' && (
           <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[2.5rem]">
                  <h2 className="text-2xl font-bold text-slate-800 mb-8">Performance Snapshot</h2>
                  <div className="space-y-8">
                     <div className="p-8 bg-slate-900 rounded-[2rem] flex items-center justify-between text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                        <div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cumulative GPA</p>
                          <p className="text-5xl font-black text-white mt-1">{studentInfo.gpa || '0.00'}</p>
                        </div>
                        <div className="h-14 w-[1px] bg-white/10" />
                        <div className="text-right">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enrolled Courses</p>
                          <p className="text-4xl font-bold text-white mt-1">{enrolled.length}</p>
                        </div>
                     </div>
                     <p className="text-slate-500 text-sm italic font-medium">This snapshot includes all graded records up to current semester. For certified inquiries, use the request button below.</p>
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem]">
                   <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-bold text-slate-800">Program Info</h2>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                               <Award size={22} />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Majoring In</p>
                              <p className="font-black text-slate-900 leading-tight uppercase">{studentInfo.program || 'General Science'}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                               <Smartphone size={22} />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Contact Hash</p>
                              <p className="font-black text-slate-900 leading-tight">{studentInfo.contact_number || '---'}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                      <Download size={22} /> Request Official Certified Transcript
                   </button>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem]">
                  <h2 className="text-2xl font-bold text-slate-800 mb-10">Financial Ledger</h2>
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">
                          <th className="pb-6">ITEM / PERIOD</th>
                          <th className="pb-6">CHARGES</th>
                          <th className="pb-6">NET TOTAL</th>
                          <th className="pb-6">REMITTANCE</th>
                          <th className="pb-6 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fees.map((f, i) => (
                          <tr key={f.fee_id} className="group">
                            <td className="py-7">
                              <p className="font-bold text-slate-900 text-lg">{f.semester || 'Academic Fee'}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Type: {f.fee_type || 'General'}</p>
                            </td>
                            <td className="py-7">
                               <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-slate-500 flex justify-between w-24"><span>BASE:</span> <span>${f.amount}</span></span>
                                  <span className="text-[10px] font-bold text-slate-500 flex justify-between w-24 text-emerald-600"><span>DISC:</span> <span>-${f.discount_amount || 0}</span></span>
                               </div>
                            </td>
                            <td className="py-7 font-black text-slate-900 leading-none">${f.net_amount}</td>
                            <td className="py-7">
                               {f.status === 'paid' ? (
                                 <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                                   <CheckCircle size={14} /> SETTLED
                                 </span>
                               ) : f.status === 'waived' ? (
                                 <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100">
                                   WAIVED
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black border border-rose-100">
                                   <AlertCircle size={14} /> UNPAID
                                 </span>
                               )}
                            </td>
                            <td className="py-7 text-right">
                               {f.status === 'paid' ? (
                                 <button 
                                   onClick={() => handleDownloadReceipt(f)}
                                   className="p-3 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100" title="Download Receipt"
                                 >
                                   <Download size={20} />
                                 </button>
                               ) : f.status === 'pending' && (
                                 <button className="py-3 px-6 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                                   PAY NOW
                                 </button>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
                      <div className="flex items-center gap-3 mb-8">
                         <div className="p-3 bg-indigo-600 rounded-2xl"><CreditCard size={24} /></div>
                         <h3 className="font-bold text-2xl">Digital Wallet</h3>
                      </div>
                      <p className="text-sm text-slate-400 font-medium mb-10 leading-relaxed">Secured via 256-bit encryption. Choose your gateway for instant clearance.</p>
                      
                      <div className="space-y-3">
                         <button className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group text-left">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center font-black italic text-xs shrink-0">J</div>
                               <span className="font-bold text-slate-200 tracking-wide uppercase text-sm">JazzCash</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                         </button>
                         <button className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group text-left">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black italic text-xs shrink-0">E</div>
                               <span className="font-bold text-slate-200 tracking-wide uppercase text-sm">EasyPaisa Hub</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
