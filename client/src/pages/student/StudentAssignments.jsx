import React from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Calendar, 
  Download 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentAssignments = ({ 
  assignments, 
  setShowSubmissionModal, 
  handleFileAction 
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Assignment Submissions</h2>
            <p className="text-xs text-slate-500 mt-1">Manage and track your coursework performance.</p>
          </div>
          <button 
            onClick={() => {
              if (assignments.length > 0) {
                setShowSubmissionModal(assignments[0]);
              } else {
                toast.error("No assignments available.");
              }
            }}
            className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 whitespace-nowrap"
          >
            <Upload size={16} /> New Submission
          </button>
        </div>
        <div className="space-y-4">
          {assignments.length > 0 ? assignments.map(a => (
            <div key={a.assignment_id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-100 group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{a.title}</h4>
                    {a.status === 'Submitted' && (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                        <CheckCircle size={8} /> Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{a.course_code} • {a.max_marks} Points</p>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="flex flex-col lg:items-end">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</span>
                  <div className={`flex items-center gap-2 text-xs font-bold ${new Date(a.deadline) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                    <Calendar size={14} /> {new Date(a.deadline).toLocaleDateString()}
                  </div>
                </div>

                <button 
                  onClick={() => setShowSubmissionModal(a)}
                  className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    a.status === 'Submitted' 
                    ? 'bg-slate-900 text-white hover:bg-indigo-600' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                  }`}
                >
                  {a.status === 'Submitted' ? 'Resubmit' : 'Submit'}
                </button>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
               <FileText size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active assignments</p>
            </div>
          )}
        </div>
      </div>

      {/* Graded Items Table */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-8">Submission History</h2>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-widest">
                <th className="pb-4">Description</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Submitted</th>
                <th className="pb-4">Grade</th>
                <th className="pb-4">Feedback</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.filter(a => a.status === 'Submitted' || a.marks_obtained !== null).map(a => (
                <tr key={a.assignment_id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.course_code}</p>
                  </td>
                  <td className="py-5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border tracking-widest uppercase ${
                      a.marks_obtained !== null ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {a.marks_obtained !== null ? 'Graded' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-5 text-xs text-slate-500 font-medium">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '--'}
                  </td>
                  <td className="py-5">
                    <div className="text-sm font-bold text-slate-900">
                      {a.marks_obtained ?? '--'}
                      <span className="text-slate-300 text-[10px] ml-1">/ {a.max_marks}</span>
                    </div>
                  </td>
                  <td className="py-5">
                     <p className="text-xs text-slate-500 font-medium italic line-clamp-1 max-w-[200px]">
                       {a.feedback || 'Evaluating...'}
                     </p>
                  </td>
                  <td className="py-5 text-right">
                    {a.submission_id && a.file_url ? (
                      <button 
                        onClick={() => handleFileAction(a.submission_id, 'download')}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-100"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    ) : (
                      <span className="text-slate-200"><Download size={14} /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.filter(a => a.status === 'Submitted' || a.marks_obtained !== null).length === 0 && (
            <p className="text-xs text-slate-400 font-medium italic text-center py-10">No submission history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
