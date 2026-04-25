import usePageTitle from '../../hooks/usePageTitle';
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
  X,
  ClipboardList,
  ExternalLink
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
  usePageTitle('Student Dashboard');
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
  const [swappingFrom, setSwappingFrom] = useState(null); // { section_id, course_code }
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to your new dynamic dashboard!", time: "Just now", type: 'info' }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Interactive Flows State
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentGateway, setPaymentGateway] = useState('JazzCash');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [gradePredictions, setGradePredictions] = useState({}); // { section_id: grade_point }
  const [gradesBreakdown, setGradesBreakdown] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, courseRes, announceRes, gradesRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/courses/available'),
        api.get('/student/announcements'),
        api.get('/student/grades')
      ]);
      setDashboardData(dashRes.data);
      setAvailableCourses(courseRes.data);
      setAnnouncements(announceRes.data || []);
      setGradesBreakdown(gradesRes.data || []);

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
    // Proactive check for overdue fees to improve UX
    const hasOverdue = (dashboardData?.fees || []).some(f => f.status === 'pending' && new Date(f.due_date) < new Date());
    if (hasOverdue) {
      toast.error('Registration Blocked: Please settle outstanding dues before enrolling.');
      return;
    }
    setConflictError(null);
    try {
      if (swappingFrom) {
        const res = await api.post('/student/swap', { 
          oldSectionId: swappingFrom.section_id, 
          newSectionId: course.section_id 
        });
        toast.success(res.data.message || 'Course swapped successfully!');
        setSwappingFrom(null);
        setActiveTab('courses');
      } else {
        const res = await api.post('/student/enroll', { sectionId: course.section_id });
        toast.success(res.data.message || 'Successfully enrolled!');
      }
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

    // Client-side validation
    const allowedTypes = ['.pdf', '.docx', '.zip', '.png', '.jpg', '.jpeg'];
    const fileExt = submissionFile.name.substring(submissionFile.name.lastIndexOf('.')).toLowerCase();
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!allowedTypes.includes(fileExt)) {
      return toast.error('Invalid file type. Allowed: PDF, DOCX, ZIP, JPG, PNG');
    }
    if (submissionFile.size > maxSize) {
      return toast.error('File too large. Maximum size is 25MB');
    }

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
  const handleFileAction = async (submissionId, action = 'view') => {
    try {
      const res = await api.get(`/student/submissions/${submissionId}/signed-url?action=${action}`);
      const signedUrl = res.data.url;
      if (action === 'view') {
        window.open(signedUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast.error("Failed to generate secure access link");
    }
  };
  const handlePayment = async () => {
    if (!showPaymentModal) return;
    try {
      const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await api.post('/student/payments', {
        fee_id: showPaymentModal.fee_id,
        amount: showPaymentModal.net_amount,
        transaction_id: transactionId,
        payment_method: paymentGateway,
        receipt_url: 'pending_verification' // In a real app, this would be a file URL or gateway response
      });
      toast.success(`Payment initiated! Please wait for system confirmation. Txn ID: ${transactionId}`);
      setShowPaymentModal(null);
      fetchData();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    }
  };
  const handleDownloadReceipt = (fee) => {
    const doc = new jsPDF();
    const student = dashboardData?.studentInfo;
    // Premium Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('OFFICIAL PAYMENT RECEIPT', 20, 30);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`REF: ${fee.fee_id.substr(0, 8).toUpperCase()}`, 20, 50);
    // Body
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('STUDENT INFORMATION', 20, 80);
    doc.line(20, 82, 190, 82);
    doc.setFontSize(10);
    doc.text(`NAME: ${student?.full_name}`, 20, 92);
    doc.text(`PROGRAM: ${student?.program || 'N/A'}`, 20, 99);
    doc.text(`SEMESTER: ${fee.semester || 'N/A'}`, 20, 106);
    autoTable(doc, {
      startY: 120,
      head: [['DESCRIPTION', 'TYPE', 'BASE AMOUNT', 'DISCOUNT', 'NET TOTAL']],
      body: [[
        fee.semester || 'Academic Fee',
        fee.fee_type || 'General',
        `$${fee.amount}`,
        `-$${fee.discount_amount || 0}`,
        `$${fee.net_amount}`
      ]],
      theme: 'striped',
      headStyles: { fillStyle: [99, 102, 241], fontSize: 10, fontStyle: 'bold' }
    });
    const finalY = (doc).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`STATUS: SETTLED / PAID`, 20, finalY);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('This is a computer generated document and does not require a physical signature.', 20, 280);
    doc.save(`Receipt_${fee.fee_id.substr(0, 8)}.pdf`);
    toast.success("Receipt downloaded successfully!");
  };
  const handleDownloadAcademicReport = () => {
    const doc = new jsPDF();
    const student = dashboardData?.studentInfo;
    const enrolled = dashboardData?.enrolled || [];
    const attendance = dashboardData?.attendance || [];
    const trendData = dashboardData?.trendData || [];
    // Premium Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('OFFICIAL ACADEMIC REPORT', 24, 30);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`E-PORTAL SYSTEM • ${new Date().toLocaleDateString()}`, 24, 45);
    // Profile Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('STUDENT PROFILE', 24, 80);
    doc.line(24, 82, 186, 82);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Full Name: ${student?.full_name}`, 24, 92);
    doc.text(`Student ID: ${student?.student_id}`, 24, 99);
    doc.text(`Program: ${student?.program}`, 120, 92);
    doc.text(`Semester: ${student?.semester}`, 120, 99);
    doc.text(`Current GPA: ${student?.gpa}`, 24, 106);
    // Enrollment Table
    autoTable(doc, {
      startY: 120,
      head: [['COURSE CODE', 'TITLE', 'CREDITS', 'INSTRUCTOR']],
      body: enrolled.map(c => [c.course_code, c.title, c.credit_hours, c.instructor_name || 'Staff']),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });
    // Attendance Summary
    const finalY = (doc).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ATTENDANCE PERFORMANCE', 24, finalY);
    doc.line(24, finalY + 2, 186, finalY + 2);
    autoTable(doc, {
      startY: finalY + 10,
      head: [['COURSE', 'ATTENDANCE %', 'TOTAL CLASSES', 'STATUS']],
      body: attendance.map(a => [
        a.course, 
        `${a.percentage}%`, 
        a.total_days, 
        a.percentage >= 75 ? 'GOOD' : 'WARNING'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' }
    });
    const reportY = (doc).lastAutoTable.finalY + 30;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This document is a certified digital export of academic records from the E-Portal Platform.', 105, 280, { align: 'center' });
    doc.save(`Transcript_${student?.student_id || 'Student'}.pdf`);
    toast.success("Academic report exported successfully!");
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
  const handleExportICS = (course) => {
    const { title, course_code, section_name, instructor_name, room, schedule_time } = course;
    // Mapping days to RRULE format
    const dayMap = { 
      'Mon': 'MO', 'Tue': 'TU', 'Wed': 'WE', 
      'Thu': 'TH', 'Fri': 'FR', 'Sat': 'SA', 'Sun': 'SU' 
    };
    // schedule_time format is typically "Mon/Wed 09:00 - 10:30" or similar
    const [daysPart, timePart] = (schedule_time || '').split(' ');
    const days = daysPart ? daysPart.split('/').map(d => dayMap[d]).filter(Boolean).join(',') : '';
    const [startRaw, endRaw] = (timePart || '08:00-09:00').split('-');
    const startStr = startRaw ? startRaw.replace(/:/g, '') + '00' : '080000';
    const endStr = endRaw ? endRaw.replace(/:/g, '') + '00' : '090000';
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const startDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//E-Portal//Student Timetable//EN',
      'BEGIN:VEVENT',
      `UID:${course.section_id}@eportal.edu`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Asia/Karachi:${startDate}T${startStr}`,
      `DTEND;TZID=Asia/Karachi:${startDate}T${endStr}`,
      days ? `RRULE:FREQ=WEEKLY;BYDAY=${days}` : '',
      `SUMMARY:${course_code} - ${title} (${section_name || 'A'})`,
      `DESCRIPTION:Instructor: ${instructor_name || 'TBD'}\\nSection: ${section_name || 'A'}`,
      `LOCATION:${room || 'TBD'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${course_code}_Schedule.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ICS calendar exported!');
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
                <div key={activeTab} className="h-[320px] w-full relative z-10" style={{ minHeight: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
            {/* Swap Mode Banner */}
            {swappingFrom && (
              <div className="mb-8 p-6 bg-indigo-600 rounded-[2rem] flex items-center justify-between text-white shadow-2xl shadow-indigo-200 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <RefreshCw size={24} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Swap Mode Active</h3>
                    <p className="text-indigo-100 font-bold text-sm">Select a new section to replace <span className="underline decoration-indigo-300 underline-offset-4">{swappingFrom.course_code}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setSwappingFrom(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel Swap
                </button>
              </div>
            )}
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
                           <div className="text-sm font-bold text-slate-600 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={16} /></div>
                              {course.instructor_name || 'Staff'}
                           </div>
                           <div className="text-sm font-bold text-slate-500 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Clock size={16} /></div>
                              {course.schedule_time || 'TBD'}
                           </div>
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
                          <button 
                            onClick={() => { setSwappingFrom(course); setActiveTab('explore'); }}
                            className="p-3 bg-white text-amber-600 rounded-xl border border-slate-200 hover:bg-amber-50 hover:border-amber-100 transition-all"
                            title="Swap Course"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button 
                            onClick={() => handleExportICS(course)}
                            className="p-3 bg-white text-indigo-600 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                            title="Export to Calendar (.ics)"
                          >
                            <Calendar size={18} />
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
                        <th className="pb-6">SUBMITTED AT</th>
                        <th className="pb-6">MY SUBMISSION</th>
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
                            <div className="text-sm font-medium text-slate-700">
                              {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '--'}
                            </div>
                          </td>
                          <td className="py-7">
                            {a.submission_id && a.file_url ? (
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleFileAction(a.submission_id, 'download')}
                                  className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                                  title="Download Submission"
                                >
                                  <Download size={14} />
                                  <span className="text-[10px] font-bold uppercase">Get</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[10px] font-bold italic uppercase">No file</span>
                            )}
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
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-10">
            {/* Academic Header */}
            <div className="glass-card p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-200">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                  <Award size={48} className="text-white drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Academic Roadmap</h2>
                  <p className="text-indigo-100 font-bold text-lg opacity-90">Track your scholastic evolution and performance metrics.</p>
                </div>
              </div>
              <button 
                onClick={handleDownloadAcademicReport}
                className="px-8 py-5 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                <Download size={20} /> Download Transcript
              </button>
            </div>
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
             {/* GPA Predictor - The 'WOW' Factor */}
             <div className="glass-card p-10 rounded-[2.5rem] mt-10 border-indigo-100 bg-indigo-50/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <TrendingUp className="text-indigo-600" /> GPA Forecasting
                    </h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Project your cumulative success</p>
                  </div>
                  <div className="px-6 py-3 bg-indigo-600 rounded-[1.5rem] text-white flex flex-col items-center shadow-xl shadow-indigo-100">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Projected GPA</span>
                    <span className="text-2xl font-black">
                      {(() => {
                        const currentGpa = parseFloat(studentInfo.gpa || 0);
                        const currentCredits = enrolled.reduce((s, c) => s + (c.credit_hours || 3), 0);
                        const historicalCredits = 60; // Mocked historical credits weight
                        let totalPoints = (currentGpa * historicalCredits);
                        let totalCredits = historicalCredits;
                        enrolled.forEach(c => {
                          const gp = gradePredictions[c.section_id] || 4.0; // Default to prediction or A
                          totalPoints += (gp * c.credit_hours);
                          totalCredits += c.credit_hours;
                        });
                        return (totalPoints / totalCredits).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolled.map(course => (
                    <div key={course.section_id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-indigo-200 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{course.course_code}</p>
                      <h4 className="font-bold text-slate-800 mb-4 line-clamp-1">{course.title}</h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-500">Target Grade:</span>
                        <select 
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-600 outline-none"
                          onChange={(e) => setGradePredictions({...gradePredictions, [course.section_id]: parseFloat(e.target.value)})}
                          defaultValue="4.0"
                        >
                          <option value="4.0">A (4.0)</option>
                          <option value="3.7">A- (3.7)</option>
                          <option value="3.3">B+ (3.3)</option>
                          <option value="3.0">B (3.0)</option>
                          <option value="2.7">B- (2.7)</option>
                          <option value="2.3">C+ (2.3)</option>
                          <option value="2.0">C (2.0)</option>
                          <option value="1.0">D (1.0)</option>
                          <option value="0.0">F (0.0)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                 <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                    <Download size={22} /> Request Official Certified Transcript
                 </button>
              </div>

              {/* Detailed Grade Breakdown */}
              <div className="glass-card p-10 rounded-[2.5rem] mt-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Assessment Breakdown</h2>
                    <p className="text-slate-500 font-medium">Detailed marks for each course component.</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {(() => {
                    // Group by Course
                    const grouped = gradesBreakdown.reduce((acc, curr) => {
                      if (!acc[curr.course_code]) {
                        acc[curr.course_code] = {
                          title: curr.course_title,
                          final_grade: curr.final_grade,
                          components: []
                        };
                      }
                      acc[curr.course_code].components.push(curr);
                      return acc;
                    }, {});

                    const courses = Object.keys(grouped);
                    if (courses.length === 0) return <p className="text-slate-400 italic text-center py-10">No assessment data released yet.</p>;

                    return courses.map(code => (
                      <div key={code} className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden transition-all hover:border-indigo-200">
                        <div className="bg-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100">
                          <div>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{code}</p>
                            <h4 className="text-xl font-black text-slate-900">{grouped[code].title}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Standing</p>
                              <p className="text-2xl font-black text-indigo-600">{grouped[code].final_grade || 'Evaluating'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 sm:p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {grouped[code].components.map(comp => {
                              const percentage = comp.marks_obtained !== null 
                                ? ((comp.marks_obtained / comp.max_marks) * 100).toFixed(0) 
                                : null;
                              
                              return (
                                <div key={comp.component_id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                  <div 
                                    className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" 
                                    style={{ width: `${percentage || 0}%` }}
                                  />
                                  <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{comp.component_name}</span>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{comp.weightage}% WT.</span>
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <span className="text-2xl font-black text-slate-900">{comp.marks_obtained ?? '--'}</span>
                                      <span className="text-sm font-bold text-slate-300 ml-1">/ {comp.max_marks}</span>
                                    </div>
                                    {percentage !== null && (
                                      <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                        {percentage}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
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
                                 <button 
                                   onClick={() => setShowPaymentModal(f)}
                                   className="py-3 px-6 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                                 >
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
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
             <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-3xl font-bold text-slate-900 leading-tight">Post Submission</h3>
                      <p className="text-slate-500 font-medium">Upload assignment for <span className="text-indigo-600 font-black">{showSubmissionModal.course_code}</span></p>
                   </div>
                   <button onClick={() => { setShowSubmissionModal(null); setSubmissionFile(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={24} className="text-slate-400" />
                   </button>
                </div>
                <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                         <FileText size={24} />
                      </div>
                      <span className="font-bold text-slate-800">{showSubmissionModal.title}</span>
                   </div>
                   <div className="flex justify-between text-xs font-black tracking-widest text-slate-400">
                      <span>MAX MARKS: {showSubmissionModal.max_marks}</span>
                      <span className={new Date(showSubmissionModal.deadline) < new Date() ? "text-rose-500" : "text-emerald-500"}>
                        DEADLINE: {new Date(showSubmissionModal.deadline).toLocaleDateString()}
                      </span>
                   </div>
                </div>
                <form onSubmit={handleSubmission}>
                   <div 
                     className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
                        submissionFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20'
                     }`}
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => {
                        e.preventDefault();
                        setSubmissionFile(e.dataTransfer.files[0]);
                     }}
                   >
                      <input 
                        type="file" 
                        id="file-upload" 
                        hidden 
                        onChange={(e) => setSubmissionFile(e.target.files[0])}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                         <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-all ${
                            submissionFile ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                         }`}>
                            {submissionFile ? <CheckCircle size={32} /> : <Upload size={32} />}
                         </div>
                         <p className="text-slate-800 font-bold text-lg">{submissionFile ? submissionFile.name : 'Choose file or drag & drop'}</p>
                         <p className="text-slate-500 text-sm mt-1 font-medium italic">Format: PDF, DOCX, ZIP, JPG, PNG (Max 25MB)</p>
                      </label>
                   </div>
                   <div className="mt-10 flex gap-4">
                      <button 
                        type="button"
                        onClick={() => { setShowSubmissionModal(null); setSubmissionFile(null); }}
                        className="flex-1 py-4 px-6 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                      >
                         Discard
                      </button>
                      <button 
                        type="submit"
                        disabled={!submissionFile}
                        className="flex-[2] py-4 px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100"
                      >
                         Submit assignment
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
             <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-3xl font-bold text-slate-900 leading-tight">Clear Dues</h3>
                      <p className="text-slate-500 font-medium">Payment for <span className="text-indigo-600 font-black">{showPaymentModal.semester}</span></p>
                   </div>
                   <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={24} className="text-slate-400" />
                   </button>
                </div>
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white mb-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
                   <p className="text-5xl font-black">${showPaymentModal.net_amount}</p>
                   <div className="mt-6 flex items-center gap-3 text-[10px] font-black tracking-widest opacity-60">
                      <CheckCircle size={14} /> SECURED SSL TRANSACTION
                   </div>
                </div>
                <div className="space-y-4 mb-10">
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Gateway</p>
                   <div className="grid grid-cols-2 gap-4">
                      {['JazzCash', 'EasyPaisa'].map(gateway => (
                        <button 
                          key={gateway}
                          onClick={() => setPaymentGateway(gateway)}
                          className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                            paymentGateway === gateway ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                          }`}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg ${
                              gateway === 'JazzCash' ? 'bg-rose-500' : 'bg-emerald-500'
                           }`}>
                              {gateway[0]}
                           </div>
                           <span className="font-bold text-slate-800 text-sm">{gateway} Hub</span>
                        </button>
                      ))}
                   </div>
                </div>
                <button 
                   onClick={handlePayment}
                   className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                   <CreditCard size={24} /> Confirm & Pay Now
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentDashboard;
