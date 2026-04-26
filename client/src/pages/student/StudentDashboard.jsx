import usePageTitle from '../../hooks/usePageTitle';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { 
  Calendar, 
  CreditCard,
  AlertCircle,
  Bell,
  Upload,
  CheckCircle,
  Clock,
  FileText,
  X,
  ArrowRight,
  Users,
  Check,
  Building,
  Smartphone,
  Wallet,
  ChevronRight,
  BookOpen,
  RefreshCw
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, Toaster } from 'react-hot-toast';
// --- Tab Components ---
import StudentOverview from './StudentOverview';
import StudentExplore from './StudentExplore';
import StudentCourses from './StudentCourses';
import StudentAssignments from './StudentAssignments';
import StudentAcademic from './StudentAcademic';
import StudentFinance from './StudentFinance';
import StudentSettings from './StudentSettings';
import StudentFeedback from './StudentFeedback';
import StudentAnnouncements from './StudentAnnouncements';

// --- Main Component ---
const StudentDashboard = () => {
  usePageTitle('Student Dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['explore', 'courses', 'assignments', 'academic', 'finance', 'settings', 'announcements', 'feedback'].includes(path)) {
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
  const [gradesBreakdown, setGradesBreakdown] = useState([]);
  const { siteSettings } = useAuthStore();

  // Enrollment Modal States
  const [showEnrollModal, setShowEnrollModal] = useState(null);
  const [enrollStep, setEnrollStep] = useState(1);
  const [enrollForm, setEnrollForm] = useState({
    sectionId: '',
    paymentMethod: '',
    receipt: null
  });
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to your new dynamic dashboard!", time: "Just now", type: 'info' }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Interactive Flows State
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentGateway, setPaymentGateway] = useState('JazzCash');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [gradePredictions, setGradePredictions] = useState({}); // { section_id: grade_point }
  const [showDropConfirm, setShowDropConfirm] = useState(null); // { section_id, course_code, title }

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
    
    // Group sections for this course
    const courseSections = availableCourses.filter(c => c.course_code === course.course_code);
    
    setShowEnrollModal({
      ...course,
      availableSections: courseSections
    });
    setEnrollStep(1);
    setEnrollForm({
      sectionId: course.section_id, // Default to the one clicked
      paymentMethod: '',
      receipt: null,
      transactionId: ''
    });
  };

  const handleEnrollSubmit = async () => {
    if (!enrollForm.sectionId || !enrollForm.paymentMethod || !enrollForm.receipt) {
      toast.error('Please complete all steps including receipt upload');
      return;
    }

    setIsSubmittingEnroll(true);
    try {
      const formData = new FormData();
      formData.append('sectionId', enrollForm.sectionId);
      formData.append('paymentMethod', enrollForm.paymentMethod);
      formData.append('receipt', enrollForm.receipt);
      formData.append('transactionId', enrollForm.transactionId);

      const res = await api.post('/student/enroll', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data.message || 'Enrollment request submitted for verification!');
      setShowEnrollModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment submission failed');
    } finally {
      setIsSubmittingEnroll(false);
    }
  };
  const handleDrop = (course) => {
    setShowDropConfirm(course);
  };

  const confirmDrop = async () => {
    if (!showDropConfirm) return;
    try {
      const res = await api.post('/student/drop', { sectionId: showDropConfirm.section_id });
      toast.success(res.data.message || 'Successfully dropped module');
      setShowDropConfirm(null);
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
    if (!paymentReceipt) {
       toast.error('Please upload a payment receipt.');
       return;
    }
    
    try {
      const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const formData = new FormData();
      formData.append('fee_id', showPaymentModal.fee_id);
      formData.append('amount', showPaymentModal.net_amount);
      formData.append('transaction_id', transactionId);
      formData.append('payment_method', paymentGateway);
      formData.append('receipt', paymentReceipt);

      await api.post('/student/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`Payment initiated! Please wait for system confirmation. Txn ID: ${transactionId}`);
      setShowPaymentModal(null);
      setPaymentReceipt(null);
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
    doc.text(`COURSE: ${student?.program || 'N/A'}`, 20, 99);
    doc.text(`SECTION: ${fee.semester || 'N/A'}`, 20, 106);
    doc.text(`REG NO: ${student?.registration_number || 'N/A'}`, 120, 92);
    doc.text(`STATUS: ${fee.status?.toUpperCase() || 'PAID'}`, 120, 99);
    autoTable(doc, {
      startY: 120,
      head: [['DESCRIPTION', 'TYPE', 'BASE AMOUNT', 'DISCOUNT', 'NET TOTAL']],
      body: [[
        fee.semester || 'Section Fee',
        fee.fee_type || 'General',
        `PKR ${fee.amount}`,
        `-PKR ${fee.discount_amount || 0}`,
        `PKR ${fee.net_amount}`
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
    const enrolled = (dashboardData?.enrolled || []).filter(e => e.status === 'enrolled');
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
    doc.text(`${(siteSettings?.siteName || 'E-PORTAL').toUpperCase()} SYSTEM • ${new Date().toLocaleDateString()}`, 24, 45);
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
    doc.text(`Course: ${student?.program || 'N/A'}`, 24, 106);
    doc.text(`Section: ${student?.semester || 'N/A'}`, 120, 92);
    doc.text(`Reg No: ${student?.registration_number}`, 120, 99);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 106);
    doc.text(`Current GPA: ${student?.gpa}`, 24, 113);
    // Enrollment Table
    autoTable(doc, {
      startY: 125,
      head: [['Course Code', 'Course Title', 'Section', 'Day', 'Time', 'Instructor']],
      body: enrolled.map(c => [
        c.course_code, 
        c.title, 
        c.section_name, 
        c.day_of_week || 'N/A', 
        `${c.start_time} - ${c.end_time}`,
        c.instructor_name
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9, cellPadding: 5 }
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
    doc.text(`This document is a certified digital export of academic records from the ${siteSettings?.siteName || 'E-Portal'} Platform.`, 105, 280, { align: 'center' });
    doc.save(`Transcript_${student?.student_id || 'Student'}.pdf`);
    toast.success("Academic report exported successfully!");
  };
  const handleDownloadTimetable = () => {
    const doc = new jsPDF();
    const student = dashboardData?.studentInfo;
    const enrolled = (dashboardData?.enrolled || []).filter(e => e.status === 'enrolled');
    // Header Styling
    doc.setFillColor(99, 102, 241); // Indigo 500
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIC TIMETABLE', 14, 25);
    doc.setFontSize(10);
    doc.text(`${(siteSettings?.siteName || 'E-PORTAL').toUpperCase()} STUDENT MANAGEMENT SYSTEM`, 14, 33);
    // Student Info Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('STUDENT INFORMATION', 14, 55);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${student?.full_name || student?.name || 'N/A'}`, 14, 63);
    doc.text(`Course: ${student?.program || 'N/A'}`, 14, 70);
    doc.text(`Section: ${student?.semester || 'N/A'}`, 14, 77);
    doc.text(`Reg No: ${student?.registration_number || 'N/A'}`, 120, 63);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 70);
    doc.text(`Status: Active Enrollment`, 120, 77);
    // Sorting Logic for Schedule
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sortedEnrolled = [...enrolled].sort((a, b) => {
      const dayA = daysOrder.findIndex(d => (a.day_of_week || '').includes(d));
      const dayB = daysOrder.findIndex(d => (b.day_of_week || '').includes(d));
      if (dayA !== dayB) return dayA - dayB;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });
    const tableData = sortedEnrolled.map(course => [
      course.course_code,
      course.title,
      course.day_of_week || 'TBD',
      course.start_time && course.end_time ? `${course.start_time} - ${course.end_time}` : 'TBD',
      course.room || 'TBD',
      `${course.credit_hours}.0`
    ]);
    autoTable(doc, {
      head: [['CODE', 'COURSE TITLE', 'DAY', 'TIME', 'VENUE', 'CREDITS']],
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
      `PRODID:-//${siteSettings?.siteName || 'E-Portal'}//Student Timetable//EN`,
      'BEGIN:VEVENT',
      `UID:${course.section_id}@${(siteSettings?.siteName || 'eportal').toLowerCase().replace(/\s+/g, '')}.edu`,
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

  const tabConfigs = {
    overview: { title: "Welcome back,", highlight: studentInfo.full_name || studentInfo.name, subtitle: "Here is what's happening with your studies today." },
    explore: { title: "Course", highlight: "Discovery", subtitle: "Explore and register for new academic modules." },
    courses: { title: "Academic", highlight: "Schedule", subtitle: "Manage your active enrollments and timetables." },
    assignments: { title: "Task", highlight: "Manager", subtitle: "Track submissions and academic assignments." },
    academic: { title: "Performance", highlight: "Insights", subtitle: "Review your grades and academic trajectory." },
    finance: { title: "Financial", highlight: "Ledger", subtitle: "Manage your fees and financial transactions." },
    announcements: { title: "Campus", highlight: "Broadcasts", subtitle: "Stay updated with latest institutional news." },
    feedback: { title: "Quality", highlight: "Assurance", subtitle: "Share your feedback to help us improve." }
  };

  const currentTab = tabConfigs[activeTab] || tabConfigs.overview;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10 relative">
      <Toaster position="top-right" />
      {/* Enhanced Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60">Student Portal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {currentTab.title} <span className="gradient-text">{currentTab.highlight}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">{currentTab.subtitle}</p>
        </div>
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-all group flex items-center gap-2"
              title="Sync Records"
            >
              <RefreshCw size={18} className="text-slate-600 group-hover:text-indigo-600 transition-all group-active:rotate-180" />
            </button>
            <div className="relative">
              <button 
                onClick={() => navigate('/student/announcements')}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-all relative group"
                title="View Announcements"
              >
                <Bell size={20} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                {announcements.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end px-5 py-2.5 bg-white border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Status</span>
            <span className="text-xs text-emerald-600 font-black flex items-center gap-1.5 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              OPEN FOR SECTION {studentInfo.semester}
            </span>
          </div>
        </div>
      </div>
      {/* Contextual Banner */}
      {unpaidFees > 0 && activeTab !== 'finance' && (
        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-700 transition-all border-l-8 border-l-rose-500 shadow-xl shadow-rose-100/20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-rose-900 font-black text-xl leading-tight">Fee Balance Outstanding</p>
              <p className="text-rose-700/80 text-sm font-bold mt-1">Your course registration for next section will be blocked until dues are cleared.</p>
            </div>
          </div>
          <button 
            onClick={() => switchTab('finance')}
            className="hidden md:flex py-4 px-8 bg-rose-600 text-white rounded-[1.25rem] font-black hover:bg-rose-700 transition-all whitespace-nowrap shadow-xl shadow-rose-200 items-center gap-3 active:scale-95"
          >
            Settle Balance <CreditCard size={20} />
          </button>
        </div>
      )}
      {/* Tab Content */}
      <div className="space-y-8 min-h-[500px]">
        {activeTab === 'overview' && (
          <StudentOverview 
            studentInfo={studentInfo}
            enrolled={enrolled}
            assignments={assignments}
            attendance={attendance}
            unpaidFees={unpaidFees}
            trendData={trendData}
            announcements={announcements}
            setActiveTab={setActiveTab}
            switchTab={switchTab}
            setShowSubmissionModal={setShowSubmissionModal}
            navigate={navigate}
          />
        )}
        {activeTab === 'explore' && (
          <StudentExplore 
            availableCourses={availableCourses}
            studentInfo={studentInfo}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            swappingFrom={swappingFrom}
            setSwappingFrom={setSwappingFrom}
            handleEnroll={handleEnroll}
            conflictError={conflictError}
            setConflictError={setConflictError}
            enrolled={enrolled}
            fetchData={fetchData}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'courses' && (
          <StudentCourses 
            enrolled={enrolled}
            handleDownloadTimetable={handleDownloadTimetable}
            handleDrop={handleDrop}
            setSwappingFrom={setSwappingFrom}
            setActiveTab={setActiveTab}
            switchTab={switchTab}
            handleExportICS={handleExportICS}
          />
        )}
        {activeTab === 'assignments' && (
          <StudentAssignments 
            assignments={assignments}
            setShowSubmissionModal={setShowSubmissionModal}
            handleFileAction={handleFileAction}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'academic' && (
          <StudentAcademic 
            studentInfo={studentInfo}
            enrolled={enrolled}
            attendance={attendance}
            gradesBreakdown={gradesBreakdown}
            gradePredictions={gradePredictions}
            setGradePredictions={setGradePredictions}
            handleDownloadAcademicReport={handleDownloadAcademicReport}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'finance' && (
          <StudentFinance 
            fees={fees}
            unpaidFees={unpaidFees}
            setShowPaymentModal={setShowPaymentModal}
            handleDownloadReceipt={handleDownloadReceipt}
            siteSettings={siteSettings}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'settings' && (
          <StudentSettings 
            studentInfo={dashboardData?.studentInfo}
            fetchData={fetchData}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'announcements' && (
          <StudentAnnouncements 
            announcements={announcements}
            switchTab={switchTab}
          />
        )}
        {activeTab === 'feedback' && (
          <StudentFeedback 
            switchTab={switchTab}
          />
        )}
      </div>
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl shadow-slate-900/10 animate-in zoom-in-95 duration-300 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Upload size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-900">Post Submission</h3>
                      <p className="text-xs font-medium text-slate-500">{showSubmissionModal.course_code}</p>
                   </div>
                </div>
                <button onClick={() => { setShowSubmissionModal(null); setSubmissionFile(null); }} className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-all">
                   <X size={20} />
                </button>
             </div>

             <div className="p-8">
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                   <div className="flex items-center gap-3 mb-3">
                      <FileText size={18} className="text-indigo-600" />
                      <span className="font-bold text-slate-900">{showSubmissionModal.title}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>{showSubmissionModal.max_marks} Points Max</span>
                      <span className={new Date(showSubmissionModal.deadline) < new Date() ? "text-rose-500" : "text-emerald-500"}>
                        Due: {new Date(showSubmissionModal.deadline).toLocaleDateString()}
                      </span>
                   </div>
                </div>

                <form onSubmit={handleSubmission}>
                   <div 
                     className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                        submissionFile ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50'
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
                      <label htmlFor="file-upload" className="cursor-pointer block">
                         <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4 transition-all ${
                            submissionFile ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'
                         }`}>
                            {submissionFile ? <CheckCircle size={24} /> : <Upload size={24} />}
                         </div>
                         <p className="text-slate-900 font-bold text-sm">{submissionFile ? submissionFile.name : 'Click to select file'}</p>
                         <p className="text-slate-400 text-xs mt-1 font-medium italic">Max size: 25MB</p>
                      </label>
                   </div>

                   <div className="mt-8 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => { setShowSubmissionModal(null); setSubmissionFile(null); }}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                      >
                         Discard
                      </button>
                      <button 
                        type="submit"
                        disabled={!submissionFile}
                        className="flex-[2] py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest"
                      >
                         Submit assignment
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Payment Modal - SaaS Style */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl shadow-slate-900/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <CreditCard size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-900">Settle Dues</h3>
                      <p className="text-xs font-medium text-slate-500">{showPaymentModal.semester}</p>
                   </div>
                </div>
                <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                   <X size={20} />
                </button>
             </div>

             <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-slate-900 rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Outstanding Balance</p>
                   <p className="text-4xl font-bold">PKR {showPaymentModal.net_amount}</p>
                   <div className="mt-4 flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      <CheckCircle size={12} /> Encrypted Transaction
                   </div>
                </div>

                <div className="space-y-3 mb-8">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Gateway</p>
                   <div className="grid grid-cols-2 gap-3">
                      {['JazzCash', 'EasyPaisa'].map(gateway => (
                        <button 
                          key={gateway}
                          onClick={() => setPaymentGateway(gateway)}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                            paymentGateway === gateway ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold italic shadow-md ${
                              gateway === 'JazzCash' ? 'bg-rose-500 shadow-rose-100' : 'bg-emerald-500 shadow-emerald-100'
                           }`}>
                              {gateway[0]}
                           </div>
                           <span className="font-bold text-slate-800 text-xs">{gateway}</span>
                        </button>
                      ))}
                   </div>
                </div>
                
                {paymentGateway && (
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                      <div className="flex items-center gap-3 mb-4">
                         <AlertCircle size={16} className="text-indigo-600" />
                         <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Payment Instructions</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-sm font-bold text-slate-900 whitespace-pre-wrap leading-relaxed">
                            {paymentGateway === 'Bank Transfer' ? siteSettings?.bankDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.` :
                             paymentGateway === 'EasyPaisa' ? siteSettings?.easypaisaDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.` :
                             siteSettings?.jazzcashDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.`}
                         </p>
                      </div>
                   </div>
                )}

                <div className="space-y-3 mb-8">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Receipt</p>
                   <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-300 transition-all group">
                      <input 
                         type="file" 
                         id="payment-receipt-upload" 
                         hidden 
                         onChange={(e) => setPaymentReceipt(e.target.files[0])}
                      />
                      <label htmlFor="payment-receipt-upload" className="cursor-pointer block">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                            {paymentReceipt ? <CheckCircle size={28} className="text-emerald-500" /> : <Upload size={28} className="text-slate-400" />}
                         </div>
                         <p className="text-sm font-bold text-slate-700">
                            {paymentReceipt ? 'Receipt Attached' : 'Upload Payment Receipt'}
                         </p>
                         <p className="text-xs text-slate-400 mt-1">
                            {paymentReceipt ? paymentReceipt.name : 'Click to browse files (JPG, PNG, PDF)'}
                         </p>
                      </label>
                   </div>
                </div>

                <button 
                   onClick={handlePayment}
                   className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3"
                >
                   <CreditCard size={18} /> Confirm Payment
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal (3-Step Flow) - SaaS Style */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl shadow-slate-900/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            
            {/* SaaS Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                     <BookOpen size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900">Course Enrollment</h3>
                     <p className="text-xs font-medium text-slate-500">Step {enrollStep} of 3 • {showEnrollModal.course_code}</p>
                  </div>
               </div>
               <button 
                 onClick={() => setShowEnrollModal(null)} 
                 className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full h-1 bg-slate-50 shrink-0">
               <div 
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
                  style={{ width: `${(enrollStep / 3) * 100}%` }}
               />
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {/* Step 1: Selection */}
               {enrollStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                     <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="font-bold text-slate-900">{showEnrollModal.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{showEnrollModal.department} • {showEnrollModal.credit_hours} Credits</p>
                           </div>
                           <span className="text-sm font-bold text-indigo-600">{enrollForm.sectionId 
                                 ? `PKR ${showEnrollModal.availableSections?.find(s => s.section_id === enrollForm.sectionId)?.enrollment_fee || showEnrollModal.enrollment_fee || '0.00'}`
                                 : `PKR ${showEnrollModal.enrollment_fee || '0.00'}`}
</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Open</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Learning Track</label>
                        <div className="grid grid-cols-1 gap-3">
                           {showEnrollModal.availableSections?.map(section => (
                              <button
                                 key={section.section_id}
                                 onClick={() => setEnrollForm({...enrollForm, sectionId: section.section_id})}
                                 className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                                    enrollForm.sectionId === section.section_id 
                                       ? 'border-indigo-600 bg-indigo-50/30' 
                                       : 'border-slate-100 hover:border-slate-200 bg-white'
                                 }`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                       enrollForm.sectionId === section.section_id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                       <Calendar size={18} />
                                    </div>
                                    <div>
                                       <p className="font-bold text-slate-800">Section {section.section_name}</p>
                                       <p className="text-xs text-slate-500">{section.day_of_week} • {section.start_time} - {section.end_time}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className={`text-xs font-bold ${Number(section.current_seats) >= section.max_seats ? 'text-rose-500' : 'text-slate-600'}`}>
                                       {section.max_seats - Number(section.current_seats)}/{section.max_seats} Slots
                                    </p>
                                    <p className="text-[10px] text-slate-400">Available</p>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Step 2: Payment */}
               {enrollStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                     <div className="grid grid-cols-1 gap-3">
                        {[
                           { id: 'EasyPaisa', label: 'EasyPaisa', icon: <Smartphone size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                           { id: 'JazzCash', label: 'JazzCash', icon: <Smartphone size={20}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
                           { id: 'Bank Transfer', label: 'Bank Transfer', icon: <Building size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                        ].map(method => (
                           <button
                              key={method.id}
                              onClick={() => setEnrollForm({...enrollForm, paymentMethod: method.id})}
                              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                 enrollForm.paymentMethod === method.id 
                                    ? 'border-indigo-600 bg-indigo-50/30' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                              }`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.bg} ${method.color}`}>
                                    {method.icon}
                                 </div>
                                 <p className="font-bold text-slate-800">{method.label}</p>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                 enrollForm.paymentMethod === method.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'
                              }`}>
                                 {enrollForm.paymentMethod === method.id && <Check size={14} />}
                              </div>
                           </button>
                        ))}
                     </div>

                     {enrollForm.paymentMethod && (
                        <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <AlertCircle size={18} className="text-indigo-400" />
                                 <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Payment Instructions</p>
                              </div>
                              <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">
                                 <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mr-2">Total:</span>
                                 <span className="text-sm font-black text-white">
                                    PKR {showEnrollModal.availableSections?.find(s => s.section_id === enrollForm.sectionId)?.enrollment_fee || showEnrollModal.enrollment_fee || '0.00'}
                                 </span>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <p className="text-sm font-bold text-white whitespace-pre-wrap leading-relaxed">
                                 {enrollForm.paymentMethod === 'Bank Transfer' ? siteSettings?.bankDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.` :
                                  enrollForm.paymentMethod === 'EasyPaisa' ? siteSettings?.easypaisaDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.` :
                                  siteSettings?.jazzcashDetails || `Account Title: ${siteSettings?.siteName || 'E-Portal'}\nDetails pending admin config.`}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* Step 3: Receipt */}
               {enrollStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                     <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-indigo-300 transition-all group">
                        <input 
                           type="file" 
                           id="receipt-upload" 
                           hidden 
                           onChange={(e) => setEnrollForm({...enrollForm, receipt: e.target.files[0]})}
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer block">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                              {enrollForm.receipt ? <CheckCircle size={32} className="text-emerald-500" /> : <Upload size={32} className="text-slate-400" />}
                           </div>
                           <p className="text-sm font-bold text-slate-700">
                              {enrollForm.receipt ? 'Receipt Attached' : 'Upload Payment Receipt'}
                           </p>
                           <p className="text-xs text-slate-400 mt-1">
                              {enrollForm.receipt ? enrollForm.receipt.name : 'Click to browse files (JPG, PNG, PDF)'}
                           </p>
                        </label>
                     </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Transaction ID (Optional)</label>
                         <input 
                            type="text"
                            placeholder="Enter payment reference or TXID"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all"
                            value={enrollForm.transactionId}
                            onChange={(e) => setEnrollForm({ ...enrollForm, transactionId: e.target.value })}
                         />
                      </div>

                     <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-amber-800 leading-relaxed">
                           Our team will verify your receipt within 24 hours. Enrollment is confirmed upon successful verification.
                        </p>
                     </div>
                  </div>
               )}
            </div>

            {/* SaaS Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
               {enrollStep > 1 ? (
                  <button 
                     onClick={() => setEnrollStep(prev => prev - 1)}
                     className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all"
                  >
                     Back
                  </button>
               ) : (
                  <button 
                     onClick={() => setShowEnrollModal(null)}
                     className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
                  >
                     Cancel
                  </button>
               )}
               <button 
                  onClick={() => enrollStep < 3 ? setEnrollStep(prev => prev + 1) : handleEnrollSubmit()}
                  disabled={(enrollStep === 1 && !enrollForm.sectionId) || (enrollStep === 2 && !enrollForm.paymentMethod) || (enrollStep === 3 && (!enrollForm.receipt || isSubmittingEnroll))}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  {isSubmittingEnroll ? (
                     <RefreshCw size={16} className="animate-spin" />
                  ) : (
                     enrollStep === 3 ? <CheckCircle size={16} /> : <ArrowRight size={16} />
                  )}
                  {isSubmittingEnroll ? 'Processing...' : enrollStep === 3 ? 'Finalize Enrollment' : 'Next Step'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showDropConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl shadow-slate-900/10 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Withdraw Module?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Are you sure you want to drop <span className="font-bold text-slate-900">{showDropConfirm.title}</span> ({showDropConfirm.course_code})? This action cannot be undone.
              </p>
              
              <div className="mt-10 flex flex-col gap-3">
                <button 
                  onClick={confirmDrop}
                  className="w-full py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-100"
                >
                  Confirm Withdrawal
                </button>
                <button 
                  onClick={() => setShowDropConfirm(null)}
                  className="w-full py-4 bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Keep Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentDashboard;
