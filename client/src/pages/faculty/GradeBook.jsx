import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  ClipboardList, Save, CheckCircle2, Download, Plus, 
  Trash2, Settings2, Calculator, AlertCircle, Info,
  ChevronRight, Layout, User, Pencil
} from 'lucide-react';
import useAuthStore from '../../store/authStore';


const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W'];

const GradeBook = () => {
  usePageTitle('Grade Book');
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [components, setComponents] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { enrollmentId: { componentId: value } }
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [gradeScale, setGradeScale] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [publishModal, setPublishModal] = useState({ show: false, enrollmentId: null, student: null, score: null, grade: null, isPublishing: false });

  // Config State
  const [newComp, setNewComp] = useState({ name: '', weightage: 0, max_marks: 100 });
  const [editingComp, setEditingComp] = useState(null);
  const currentUser = useAuthStore(state => state.user);




  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 4000);
  };

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => {
        setCourses(res.data);
        if (!selectedSection && res.data.length > 0) setSelectedSection(res.data[0].section_id);
      })
      .catch(() => showToast('error', 'Failed to load courses.'));

    api.get('/faculty/grade-scale')
      .then(res => setGradeScale(res.data))
      .catch(err => console.error("Grade scale fetch error:", err));
  }, []);


  const fetchData = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const res = await api.get(`/faculty/sections/${selectedSection}/gradebook`);
      setComponents(res.data.components);
      setInstructor(res.data.instructor);


      
      const marksMap = {};
      res.data.marks.forEach(m => {
        if (!marksMap[m.enrollment_id]) marksMap[m.enrollment_id] = {};
        marksMap[m.enrollment_id][m.component_id] = m.marks_obtained;
      });

      const studentsWithMarks = res.data.students.map(s => ({
        ...s,
        marks: marksMap[s.enrollment_id] || {}
      }));
      
      setStudents(studentsWithMarks);
      setMarks(marksMap);

    } catch (err) {
      showToast('error', 'Failed to load gradebook data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedSection]);

  const handleAddComponent = async () => {
    const currentWeight = components.reduce((sum, c) => sum + c.weightage, 0);
    if (currentWeight + parseInt(newComp.weightage) > 100) {
      return showToast('error', 'Total weightage cannot exceed 100%');
    }

    try {
      const res = await api.post(`/faculty/sections/${selectedSection}/assessments`, newComp);
      setComponents([...components, res.data]);
      setNewComp({ name: '', weightage: 0, max_marks: 100 });
      showToast('success', 'Component added!');
    } catch (err) {
      showToast('error', 'Failed to add component.');
    }
  };

  const handleDeleteComponent = async (id) => {
    try {
      await api.delete(`/faculty/assessments/${id}`);
      setComponents(components.filter(c => c.component_id !== id));
      showToast('success', 'Component removed.');
    } catch (err) {
      showToast('error', 'Failed to delete component.');
    }
  };

  const handleMarkUpdate = async (enrollmentId, componentId, value) => {

    if (value === '' || isNaN(value)) return;

    try {
      await api.patch(`/faculty/enrollments/${enrollmentId}/components/${componentId}/marks`, {
        marksObtained: parseFloat(value) || 0
      });
    } catch (err) {
      console.error('Error updating mark:', err);
      showToast('error', 'Failed to save marks.');
    }
  };

  const calculateTotalScore = (student) => {
    let totalScore = 0;
    components.forEach(comp => {
      const studentMark = student.marks?.[comp.component_id] || 0;
      const componentScore = (studentMark / comp.max_marks) * comp.weightage;
      totalScore += componentScore;
    });
    return totalScore.toFixed(1);
  };

  const getGradeFromScore = (score) => {
    const s = parseFloat(score);
    if (gradeScale && gradeScale.length > 0) {
      const scaleEntry = gradeScale.find(g => s >= g.min_score);
      return scaleEntry ? scaleEntry.grade : 'F';
    }
    if (s >= 90) return 'A+';
    if (s >= 85) return 'A';
    if (s >= 80) return 'A-';
    if (s >= 75) return 'B+';
    if (s >= 70) return 'B';
    if (s >= 65) return 'B-';
    if (s >= 60) return 'C+';
    if (s >= 55) return 'C';
    if (s >= 50) return 'C-';
    if (s >= 40) return 'D';
    return 'F';
  };


  const openPublishModal = (enrollmentId) => {
    const student = students.find(s => s.enrollment_id === enrollmentId);
    if (!student) return;
    const score = calculateTotalScore(student);
    const grade = getGradeFromScore(score);
    setPublishModal({ show: true, enrollmentId, student, score, grade });
  };

  const confirmPublishGrade = async () => {
    if (!publishModal.enrollmentId || publishModal.isPublishing) return;
    setPublishModal(prev => ({ ...prev, isPublishing: true }));
    try {
      await api.patch(`/faculty/enrollments/${publishModal.enrollmentId}/grade`, { grade: publishModal.grade });
      await fetchData();
      showToast('success', 'Grade published successfully!');
    } catch (err) {
      showToast('error', 'Failed to publish grade.');
    } finally {
      setPublishModal({ show: false, enrollmentId: null, student: null, score: null, grade: null, isPublishing: false });
    }
  };

  const selectedCourse = courses.find(c => c.section_id === selectedSection);
  const totalWeight = components.reduce((sum, c) => sum + c.weightage, 0);

  const studentScores = students.map(s => calculateTotalScore(s));
  const avgScore = studentScores.length > 0 
    ? (studentScores.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / studentScores.length).toFixed(1) 
    : 0;
  
  const distribution = students.reduce((acc, s) => {
    const grade = getGradeFromScore(calculateTotalScore(s));
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const passCount = studentScores.filter(s => getGradeFromScore(s) !== 'F').length;
  const passRate = studentScores.length > 0 ? ((passCount / studentScores.length) * 100).toFixed(0) : 0;


  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-6 animate-in fade-in duration-500 print-area">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-full ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm">{toast.msg}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Grade Book</h1>
          <p className="text-slate-500 font-medium ml-1">Advanced marking system with automated weighted calculations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
              showConfig ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings2 size={18} /> {showConfig ? 'Close Configuration' : 'Configure Weightage'}
          </button>
          
          <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />

          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm min-w-[280px]"
          >
            {courses.map(c => (
              <option key={c.section_id} value={c.section_id}>
                {c.course_code} — {c.title} (Sec {c.section_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Class Average</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
            <span className="text-sm font-bold text-emerald-500 mb-1">Overall</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Pass Rate</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900">{passRate}%</span>
            <span className="text-sm font-bold text-slate-400 mb-1">{passCount}/{students.length} Students</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Grade Distribution</p>
          <div className="flex items-center gap-2">
            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(g => (
              <div key={g} className="flex-1 group relative">
                <div 
                  className={`w-full h-8 rounded-lg transition-all ${distribution[g] ? 'bg-violet-500' : 'bg-slate-100'}`}
                  style={{ height: `${(distribution[g] || 0) * 20 + 8}px` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {distribution[g] || 0}
                </div>
                <p className="text-[10px] font-black text-slate-400 text-center mt-2">{g}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 print:hidden">

          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-violet-600" /> Add Assessment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Midterm Exam"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                  value={newComp.name}
                  onChange={e => setNewComp({...newComp, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Weight (%)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                    value={newComp.weightage}
                    onChange={e => setNewComp({...newComp, weightage: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Max Marks</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                    value={newComp.max_marks}
                    onChange={e => setNewComp({...newComp, max_marks: e.target.value})}
                  />
                </div>
              </div>
              <button
                onClick={handleAddComponent}
                className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-[0.98]"
              >
                Add Component
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200 border-dashed">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              Active Components 
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Total: {totalWeight}% / 100%
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {components.map(comp => (
                <div key={comp.component_id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center font-black">
                      {comp.weightage}%
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{comp.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">Max Marks: {comp.max_marks}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteComponent(comp.component_id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {components.length === 0 && (
                <div className="col-span-2 py-10 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Info size={32} strokeWidth={1.5} />
                  <p className="font-medium">No assessment components defined yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Gradebook Table */}
      <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        
        {/* Print Only Header */}
        <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">Official Grade Report</h1>
          <div className="mt-4 grid grid-cols-2 gap-4 text-left font-bold text-slate-700">
            <p>Course: {selectedCourse?.course_code || 'N/A'} — {selectedCourse?.title || 'N/A'}</p>
            <p className="text-right">Section: {selectedCourse?.section_name || 'N/A'}</p>
            <p>Faculty: {instructor?.instructor_name || currentUser?.name || 'Instructor'} {instructor?.instructor_department || currentUser?.department ? `(${instructor?.instructor_department || currentUser?.department})` : ''}</p>

            <p className="text-right">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full border-collapse print:table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100 print:bg-white print:border-b-2 print:border-slate-900">
                <th className="sticky left-0 bg-slate-50/50 z-10 p-6 text-left min-w-[280px] print:static print:p-2 print:w-1/3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400 print:hidden" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest print:text-slate-900">Student Name</span>
                  </div>
                </th>
                {components.map(comp => (
                  <th key={comp.component_id} className="p-6 text-center min-w-[100px] border-l border-slate-100 print:p-2 print:border-slate-300">
                    <p className="text-sm font-black text-slate-900">{comp.name}</p>
                    <p className="text-[10px] font-black text-violet-500 uppercase tracking-tighter mt-0.5 print:text-slate-500">
                      ({comp.weightage}%)
                    </p>
                  </th>
                ))}
                <th className="p-6 text-center min-w-[120px] bg-violet-50/30 border-l border-slate-100 print:bg-white print:border-slate-900">
                  <span className="text-xs font-black text-violet-600 uppercase tracking-widest print:text-slate-900">Total</span>
                </th>
                <th className="p-6 text-center min-w-[100px] bg-slate-900 z-10 print:bg-white print:border-l-2 print:border-slate-900">
                  <span className="text-xs font-black text-white uppercase tracking-widest print:text-slate-900">Grade</span>
                </th>
                <th className="p-6 text-center min-w-[140px] print:hidden">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-10 bg-slate-100 rounded-2xl w-full" /></td>
                    {components.map((_, j) => (
                      <td key={j} className="p-6"><div className="h-10 bg-slate-50 rounded-xl w-16 mx-auto" /></td>
                    ))}
                    <td className="p-6 bg-violet-50/10"><div className="h-10 bg-violet-100/50 rounded-2xl w-full" /></td>
                    <td className="p-6 bg-slate-800/5"><div className="h-10 bg-slate-200 rounded-2xl w-full" /></td>
                    <td className="p-6"><div className="h-10 bg-slate-100 rounded-2xl w-full" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={components.length + 4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Layout size={64} strokeWidth={1} />
                      <p className="text-xl font-bold text-slate-400">No students enrolled</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const score = calculateTotalScore(s);
                  const grade = getGradeFromScore(score);
                  
                  return (
                    <tr key={s.enrollment_id} className="hover:bg-slate-50/40 transition-colors group print:break-inside-avoid">
                      <td className="sticky left-0 bg-white group-hover:bg-slate-50/80 z-10 p-6 print:static print:p-2">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg print:hidden">
                            {s.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 truncate text-sm print:text-base">{s.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 truncate print:text-slate-600">{s.program} • {s.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      {components.map(comp => (
                        <td key={comp.component_id} className="p-4 border-l border-slate-50 group-hover:bg-slate-50/30 transition-colors print:p-2 print:text-center print:border-slate-200">
                          <input 
                            type="number"
                            value={s.marks?.[comp.component_id] ?? ''}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (val !== '') {
                                  if (Number(val) > comp.max_marks) {
                                    val = comp.max_marks;
                                    showToast('error', `Max marks allowed is ${comp.max_marks}`);
                                  } else if (Number(val) < 0) {
                                    val = 0;
                                  }
                                }
                                setStudents(prev => prev.map(stud => 
                                  stud.enrollment_id === s.enrollment_id 
                                    ? { ...stud, marks: { ...stud.marks, [comp.component_id]: val } } 
                                    : stud
                                ));
                            }}
                            onBlur={(e) => handleMarkUpdate(s.enrollment_id, comp.component_id, e.target.value)}
                            className="w-20 mx-auto block px-2 py-2 text-center font-bold text-slate-800 bg-slate-50 border border-transparent rounded-xl outline-none print:bg-white print:w-full print:p-0"
                          />
                        </td>
                      ))}

                      <td className="p-6 text-center bg-violet-50/30 border-l border-slate-100 print:bg-white print:border-slate-900">
                        <span className="text-lg font-black text-violet-700 print:text-slate-900">{score}%</span>
                      </td>

                      <td className="p-6 text-center bg-slate-900/5 z-10 print:bg-white print:border-l-2 print:border-slate-900">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg shadow-lg print:shadow-none print:w-auto print:h-auto ${
                          grade === 'F' ? 'bg-rose-500 text-white print:text-rose-600' :
                          grade.startsWith('A') ? 'bg-emerald-500 text-white print:text-emerald-600' :
                          'bg-white text-slate-900 border-2 border-slate-200 print:border-0'
                        }`}>
                          {grade}
                        </div>
                      </td>

                      <td className="p-6 text-center print:hidden">
                        <div className="flex items-center mx-auto justify-center">
                          <button 
                            onClick={() => openPublishModal(s.enrollment_id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                              s.grade === grade 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                              : 'bg-violet-600 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:translate-y-[-1px] active:scale-[0.95]'
                            }`}
                          >
                            {s.grade === grade ? (
                              <><CheckCircle2 size={14} /> Published</>
                            ) : (
                              <><Save size={14} /> Publish</>
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" /> A+ to A- (High Performing)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" /> F (Failing)
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={18} /> Print Grade Sheet
          </button>
        </div>
      </div>

      {/* Custom Publish Modal */}
      {publishModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
              <h3 className="text-xl font-black flex items-center gap-2">
                <AlertCircle size={24} className="text-violet-200" />
                Publish Final Grade
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 font-medium">
                You are about to publish the final grade for <span className="font-black text-slate-900">{publishModal.student?.name}</span>.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Score</p>
                  <p className="text-lg font-black text-slate-900">{publishModal.score}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Grade</p>
                  <p className={`text-2xl font-black ${publishModal.grade === 'F' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {publishModal.grade}
                  </p>
                </div>
              </div>

              <p className="text-sm text-amber-600 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                <Info size={18} className="shrink-0 mt-0.5" />
                This action will be recorded permanently in the student's academic record.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                disabled={publishModal.isPublishing}
                onClick={() => setPublishModal({ show: false, enrollmentId: null, student: null, score: null, grade: null, isPublishing: false })}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={publishModal.isPublishing}
                onClick={confirmPublishGrade}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {publishModal.isPublishing ? (
                  <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Publishing...</>
                ) : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide non-essential layout elements */
          nav, aside, header, footer, .print\\:hidden { 
            display: none !important; 
          }

          /* Ensure the main content takes full width */
          body, #root, main { 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          .print-area {
            display: block !important;
            width: 100% !important;
          }

          /* Input styling for print */
          input { 
            border: none !important; 
            box-shadow: none !important; 
            background: transparent !important; 
            appearance: none;
            -moz-appearance: textfield;
          }
          input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          @page { size: auto; margin: 15mm; }
        }
      `}} />


    </div>
  );
};

export default GradeBook;

