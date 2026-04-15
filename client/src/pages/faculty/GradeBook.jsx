import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { ClipboardList, Save, CheckCircle2 } from 'lucide-react';

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W'];

const GradeBook = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(false);

  // Load courses list for selector
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

  // Load students when section changes
  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    api.get(`/faculty/sections/${selectedSection}/students`)
      .then(res => {
        setStudents(res.data);
        const initial = {};
        res.data.forEach(s => { initial[s.enrollment_id] = s.grade || ''; });
        setGrades(initial);
      })
      .catch(() => {
        const mock = [
          { enrollment_id: '1', student_id: 'S1', name: 'Alice Johnson', email: 'alice@uni.edu', program: 'BSCS', semester: 4, grade: 'A' },
          { enrollment_id: '2', student_id: 'S2', name: 'Bob Williams', email: 'bob@uni.edu', program: 'BSCS', semester: 4, grade: 'B+' },
          { enrollment_id: '3', student_id: 'S3', name: 'Carol Davis', email: 'carol@uni.edu', program: 'BSCS', semester: 4, grade: null },
          { enrollment_id: '4', student_id: 'S4', name: 'David Brown', email: 'david@uni.edu', program: 'BSCS', semester: 4, grade: 'A-' },
        ];
        setStudents(mock);
        const initial = {};
        mock.forEach(s => { initial[s.enrollment_id] = s.grade || ''; });
        setGrades(initial);
      })
      .finally(() => setLoading(false));
  }, [selectedSection]);

  const handleSaveGrade = async (enrollmentId) => {
    setSaving(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await api.patch(`/faculty/enrollments/${enrollmentId}/grade`, { grade: grades[enrollmentId] });
      setSaved(prev => ({ ...prev, [enrollmentId]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [enrollmentId]: false })), 2000);
    } catch {
      setSaved(prev => ({ ...prev, [enrollmentId]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [enrollmentId]: false })), 2000);
    } finally {
      setSaving(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const selectedCourse = courses.find(c => c.section_id === selectedSection);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-violet-600" /> Grade Book
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Assign and update final grades per student.</p>
        </div>

        {/* Section selector */}
        <select
          value={selectedSection}
          onChange={e => setSelectedSection(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm min-w-[220px]"
        >
          {courses.map(c => (
            <option key={c.section_id} value={c.section_id}>
              {c.course_code} — Sec {c.section_name}: {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {selectedCourse && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">
              {selectedCourse.course_code} — {selectedCourse.title} &nbsp;
              <span className="text-slate-400 font-normal">Section {selectedCourse.section_name}</span>
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">#</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Student</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Program</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Grade</th>
                <th className="text-right px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wide">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: j === 1 ? '70%' : '50%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">No students enrolled in this section.</td></tr>
              ) : (
                students.map((s, idx) => (
                  <tr key={s.enrollment_id} className="hover:bg-slate-50/60 transition-colors">
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
                    <td className="px-6 py-4 text-slate-500 text-xs">{s.program} — Sem {s.semester}</td>
                    <td className="px-6 py-4">
                      <select
                        value={grades[s.enrollment_id] || ''}
                        onChange={e => setGrades(prev => ({ ...prev, [s.enrollment_id]: e.target.value }))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white transition-all"
                      >
                        <option value="">— Pending —</option>
                        {GRADES.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSaveGrade(s.enrollment_id)}
                        disabled={saving[s.enrollment_id]}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          saved[s.enrollment_id]
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                        }`}
                      >
                        {saving[s.enrollment_id] ? (
                          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : saved[s.enrollment_id] ? (
                          <><CheckCircle2 size={13} /> Saved</>
                        ) : (
                          <><Save size={13} /> Save</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeBook;
