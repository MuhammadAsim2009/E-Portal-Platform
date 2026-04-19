import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { CalendarCheck, CheckCircle2, Save, Upload, Info } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];
const STATUS_STYLE = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  excused: 'bg-sky-50 text-sky-700 border-sky-200',
};
const AttendancePage = () => {
  usePageTitle('Attendance Page');
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    setSubmitted(false);
    api.get(`/faculty/sections/${selectedSection}/students`)
      .then(res => {
        setStudents(res.data);
        const init = {};
        res.data.forEach(s => { init[s.student_id] = 'present'; });
        setStatuses(init);
      })
      .catch(() => {
        const mock = [
          { student_id: 'S1', name: 'Alice Johnson', email: 'alice@uni.edu' },
          { student_id: 'S2', name: 'Bob Williams', email: 'bob@uni.edu' },
          { student_id: 'S3', name: 'Carol Davis', email: 'carol@uni.edu' },
          { student_id: 'S4', name: 'David Brown', email: 'david@uni.edu' },
        ];
        setStudents(mock);
        const init = {};
        mock.forEach(s => { init[s.student_id] = 'present'; });
        setStatuses(init);
      })
      .finally(() => setLoading(false));
  }, [selectedSection]);
  const handleCSVImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const newStatuses = { ...statuses };
      let updatedCount = 0;
      lines.forEach(line => {
        const [email, status] = line.split(',').map(s => s?.trim().toLowerCase());
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
      } else {
        toast.error("No matching student records found in CSV. Check format: email,status");
      }
    };
    reader.readAsText(file);
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    const records = Object.entries(statuses).map(([studentId, status]) => ({ studentId, status }));
    try {
      await api.post(`/faculty/sections/${selectedSection}/attendance`, { date, records });
      toast.success("Attendance submitted successfully!");
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarCheck size={22} className="text-violet-600" /> Attendance
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Mark and submit daily student attendance.</p>
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
        <div className="w-full lg:w-auto self-end">
           <input 
             type="file" 
             id="csv-upload" 
             hidden 
             accept=".csv"
             onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleCSVImport(file);
             }}
           />
           <label 
             htmlFor="csv-upload"
             className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl font-bold text-slate-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/30 transition-all cursor-pointer group whitespace-nowrap"
           >
              <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Bulk CSV Import
           </label>
        </div>
      </div>
      {/* Summary badges */}
      {students.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {s.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{s.name}</p>
                          <p className="text-slate-400 text-xs">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(status => (
                          <button
                            key={status}
                            onClick={() => setStatuses(prev => ({ ...prev, [s.student_id]: status }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                              statuses[s.student_id] === status
                                ? STATUS_STYLE[status] + ' ring-2 ring-offset-1 ring-current'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
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
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
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
          </div>
        )}
      </div>
    </div>
  );
};
export default AttendancePage;
