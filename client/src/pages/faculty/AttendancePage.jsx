import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { CalendarCheck, CheckCircle2, Save, Upload, Info, GraduationCap, User, Download, X, ChevronRight, Loader2, FileText } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];
const STATUS_STYLE = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  excused: 'bg-sky-50 text-sky-700 border-sky-200',
};
const AttendancePage = () => {
  const currentUser = useAuthStore(state => state.user);

  usePageTitle('Attendance Tracking');
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [isDateSubmitted, setIsDateSubmitted] = useState(false);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => {
        setCourses(res.data);
        if (!selectedSection && res.data.length > 0) setSelectedSection(res.data[0].section_id);
      })
      .catch(() => {
        setCourses([
          { section_id: '1', course_code: 'CS-201', section_name: 'A', title: 'Data Structures' },
          { section_id: '2', course_code: 'CS-301', section_name: 'B', title: 'Algorithms' },
        ]);
        if (!selectedSection) setSelectedSection('1');
      });
  }, []);
  const fetchAttendance = async () => {
    if (!selectedSection) return;
    setLoading(true);
    setSubmitted(false);
    try {
      const res = await api.get(`/faculty/sections/${selectedSection}/attendance?date=${date}`);
      setStudents(res.data.students);
      setInstructor(res.data.instructor);
      const init = {};
      let hasSubmitted = false;
      res.data.students.forEach(s => { 
        if (s.current_status) hasSubmitted = true;
        init[s.student_id] = s.current_status || 'present'; 
      });
      setStatuses(init);
      setIsDateSubmitted(hasSubmitted);

    } catch (err) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedSection, date]);

  const handleDownloadTemplate = () => {
    let csvContent = "data:text/csv;charset=utf-8,Name,Email,Status\n";
    students.forEach(s => {
      csvContent += `"${s.name}",${s.email},present\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_template_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const newStatuses = { ...statuses };
      let updatedCount = 0;
      
      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        if (!line.trim()) return;
        
        // Since format is: "Name",Email,Status
        // We can split by comma and extract from the end to avoid name commas
        const parts = line.split(',');
        if (parts.length < 3) return;
        
        const status = parts.pop()?.trim().toLowerCase();
        const email = parts.pop()?.trim().toLowerCase();
        
        if (!email || !status) return;
        
        // Find student by email
        const student = students.find(s => s.email.toLowerCase() === email);
        if (student && STATUS_OPTIONS.includes(status)) {
          newStatuses[student.student_id] = status;
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        setStatuses(newStatuses);
        toast.success(`Successfully imported ${updatedCount} records from CSV.`);
        setImportModal(false);
      } else {
        toast.error("No matching student records found in CSV. Check format: email,status");
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    const records = Object.entries(statuses).map(([studentId, status]) => ({ studentId, status }));
    try {
      await api.post(`/faculty/sections/${selectedSection}/attendance`, { date, records });
      toast.success("Attendance submitted successfully!");
      setIsDateSubmitted(true);
      fetchAttendance(); // Refresh to get updated overall stats
    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };
  // Summary counts
  const counts = Object.values(statuses).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:space-y-0 print:p-0">
      
      {/* Print Only Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">Attendance Report</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 text-left font-bold text-slate-700">
          <p>Course: {courses.find(c => c.section_id == selectedSection)?.course_code} — {courses.find(c => c.section_id == selectedSection)?.title}</p>
          <p className="text-right">Section: {courses.find(c => c.section_id == selectedSection)?.section_name}</p>
          <p>Faculty: {instructor?.instructor_name || currentUser?.name || 'Instructor'} ({instructor?.instructor_department || currentUser?.department || 'Department'})</p>

          <p className="text-right">Date: {new Date(date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Tracking</h1>
          <p className="text-slate-500 font-medium">Mark and submit daily student attendance for your sections</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm"
            >
              <FileText size={20} className="text-indigo-600" />
              <span>Export Report</span>
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/25"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <CalendarCheck size={20} />}
              <span>{isDateSubmitted ? 'Update Attendance' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>
      </div>


      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="w-full lg:flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Active Course Section</label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all appearance-none cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.section_id} value={c.section_id}>
                {c.course_code} — Sec {c.section_name}: {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full lg:w-48">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Marked Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
          />
        </div>
        {!isDateSubmitted && (
          <div className="w-full lg:w-auto self-end">
             <button 
               onClick={() => setImportModal(true)}
               className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl font-bold text-slate-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/30 transition-all cursor-pointer group whitespace-nowrap"
             >
                <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Bulk CSV Import
             </button>
          </div>
        )}
      </div>
      {/* Summary badges */}
      {students.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 mb-4">
          {STATUS_OPTIONS.map(s => (
            <span key={s} className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLE[s]}`}>
              {s}: {counts[s] || 0}
            </span>
          ))}
        </div>
      )}
      {/* Student List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">#</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Student</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(3)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: j === 1 ? '70%' : '40%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr><td colSpan={3} className="py-16 text-center text-slate-400">No students in this section.</td></tr>
              ) : (
                students.map((s, idx) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {s.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{s.name}</p>
                            <p className="text-slate-400 text-xs">{s.email}</p>
                          </div>
                        </div>
                        {s.overall_percentage !== null && (
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall</p>
                            <p className={`text-xs font-black ${s.overall_percentage < 0.75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {Math.round(s.overall_percentage * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              if (!isDateSubmitted) {
                                setStatuses(prev => ({ ...prev, [s.student_id]: status }));
                              }
                            }}
                            disabled={isDateSubmitted}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                              statuses[s.student_id] === status
                                ? STATUS_STYLE[status] + ' ring-2 ring-offset-1 ring-current'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            } ${isDateSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {students.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {isDateSubmitted && (
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Attendance has been permanently submitted for this date.
                </p>
              )}
            </div>
            {!isDateSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  submitted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : submitted ? (
                  <><CheckCircle2 size={16} /> Attendance Saved!</>
                ) : (
                  <><Save size={16} /> Submit Attendance</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100/50">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 shadow-inner">
                    <Upload size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Import</h3>
                  <p className="text-slate-500 font-medium mt-1">Upload attendance via CSV file</p>
                </div>
                <button 
                  onClick={() => setImportModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Context Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Selected Section</span>
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {courses.find(c => c.section_id === selectedSection)?.course_code} - Sec {courses.find(c => c.section_id === selectedSection)?.section_name}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Marking Date</span>
                  <p className="font-bold text-slate-800 text-sm truncate">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button 
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
                      <Download size={14} className="text-slate-500 group-hover:text-violet-700" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">1. Download Template</p>
                      <p className="text-xs font-medium text-slate-400 group-hover:text-violet-400">Pre-filled with {students.length} students</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-400" />
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    id="modal-csv-upload" 
                    hidden 
                    accept=".csv"
                    onChange={handleCSVImport}
                  />
                  <label 
                    htmlFor="modal-csv-upload"
                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 rounded-2xl text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Upload size={14} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">2. Upload Completed CSV</p>
                        <p className="text-xs font-medium text-slate-300">Click to browse files</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-500 group-hover:text-slate-400" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
