import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../services/api';
import { FileText, ChevronLeft, CheckCircle2, Clock, AlertCircle, ExternalLink, MessageSquare, Save } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();
  usePageTitle('View Submissions');
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, assignmentRes] = await Promise.all([
          api.get(`/faculty/assignments/${assignmentId}/submissions`),
          api.get(`/faculty/assignments/${assignmentId}`)
        ]);
        setSubmissions(subRes.data);
        setAssignment(assignmentRes.data);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assignmentId]);

  const handleGrade = async (subId, marks, feedback) => {
    try {
      await api.patch(`/faculty/submissions/${subId}/grade`, { marks, feedback });
      toast.success("Grade updated successfully!");
      setSubmissions(submissions.map(s => s.submission_id === subId ? { ...s, marks_obtained: marks, feedback: feedback } : s));
      setGrading(null);
    } catch (err) {
      toast.error("Failed to update grade");
    }
  };

  const handleExport = () => {
    if (submissions.length === 0) return toast.error('No submissions to export');
    const headers = ['Student Name', 'Email', 'Submitted At', 'Status', 'Marks', 'Feedback'];
    const csvData = submissions.map(s => [
      s.student_name,
      s.student_email,
      new Date(s.submitted_at).toLocaleString(),
      s.is_late ? 'Late' : 'On-time',
      s.marks_obtained ?? 'Ungraded',
      `"${(s.feedback || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `grades_${assignmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex items-center gap-4">
        <Link to="/faculty/assignments" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {assignment?.title || 'Assignment Submissions'}
          </h1>
          <p className="text-slate-500 text-sm">
            {assignment ? `${assignment.course_code} - ${assignment.course_name} (${assignment.section_name})` : 'Review and grade work submitted by students.'}
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="ml-auto px-6 py-2.5 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <FileText size={16} /> Download CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted At</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">File</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Marks</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold">No submissions received yet.</td>
                </tr>
              ) : (
                submissions.map(s => (
                  <tr key={s.submission_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900">{s.student_name}</div>
                      <div className="text-xs text-slate-500">{s.student_email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-700">{new Date(s.submitted_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      {s.is_late ? (
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black tracking-widest rounded-lg border border-red-100 uppercase flex items-center w-fit gap-1">
                          <AlertCircle size={12} /> Late
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest rounded-lg border border-emerald-100 uppercase flex items-center w-fit gap-1">
                          <CheckCircle2 size={12} /> On Time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <a href={s.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-violet-600 font-bold text-sm hover:underline">
                        View File <ExternalLink size={14} />
                      </a>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-sm font-black ${s.marks_obtained !== null ? 'text-slate-900' : 'text-slate-300'}`}>
                        {s.marks_obtained ?? 'Not Graded'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => setGrading(s)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                      >
                        {s.marks_obtained !== null ? 'Re-Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Grade Submission</h3>
              <p className="text-slate-500 mb-8 font-medium">Grading {grading.student_name}'s work.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Marks Obtained</label>
                  <input 
                    type="number"
                    defaultValue={grading.marks_obtained}
                    id="marks-input"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Written Feedback</label>
                  <textarea 
                    rows={4}
                    defaultValue={grading.feedback}
                    id="feedback-input"
                    placeholder="Provide constructive feedback..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-medium text-slate-700 transition-all"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setGrading(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleGrade(
                      grading.submission_id, 
                      document.getElementById('marks-input').value, 
                      document.getElementById('feedback-input').value
                    )}
                    className="flex-[2] py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Grade
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissions;
