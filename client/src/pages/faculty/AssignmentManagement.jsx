import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Plus, Trash2, Calendar, Clock, BarChart2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
const AssignmentManagement = () => {
  usePageTitle('Assignment Management');
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    max_marks: 10,
    submission_type: 'file'
  });
  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => {
        setCourses(res.data);
        if (!selectedSection && res.data.length > 0) setSelectedSection(res.data[0].section_id);
      })
      .catch(() => {
        setCourses([
          { section_id: '1', course_code: 'CS-201', section_name: 'A', title: 'Data Structures' },
        ]);
        if (!selectedSection) setSelectedSection('1');
      });
  }, []);
  const fetchAssignments = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const res = await api.get(`/faculty/sections/${selectedSection}/assignments`);
      setAssignments(res.data);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAssignments();
  }, [selectedSection]);
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/faculty/sections/${selectedSection}/assignments`, formData);
      toast.success("Assignment created successfully!");
      setShowCreateModal(false);
      setFormData({ title: '', description: '', deadline: '', max_marks: 10, submission_type: 'file' });
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment? All submissions will be lost.")) return;
    try {
      await api.delete(`/faculty/assignments/${id}`);
      toast.success("Assignment deleted");
      fetchAssignments();
    } catch {
      toast.error("Failed to delete assignment");
    }
  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={22} className="text-violet-600" /> Assignment Portal
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Create and manage evaluations for your students.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all appearance-none cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.section_id} value={c.section_id}>
                {c.course_code} — Sec {c.section_name}
              </option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center gap-2"
          >
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white border border-slate-200 rounded-3xl animate-pulse" />
          ))
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
             <FileText size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-bold">No assignments created yet for this section.</p>
             <button onClick={() => setShowCreateModal(true)} className="mt-4 text-violet-600 font-black uppercase text-xs tracking-widest underline">Create your first task</button>
          </div>
        ) : (
          assignments.map(a => (
            <div key={a.assignment_id} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-2xl hover:border-violet-200 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(a.assignment_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>
               <div className="mb-6">
                  <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black tracking-widest rounded-lg border border-violet-100 uppercase">
                     {a.submission_type || 'Manual'} Task
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-4 leading-tight">{a.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{a.description || 'No description provided.'}</p>
               </div>
               <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={16} /> 
                        <span className="font-semibold">Deadline</span>
                     </div>
                     <span className={`font-bold ${new Date(a.deadline) < new Date() ? 'text-red-500' : 'text-slate-700'}`}>
                        {new Date(a.deadline).toLocaleDateString()}
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2 text-slate-500">
                        <BarChart2 size={16} /> 
                        <span className="font-semibold">Max Marks</span>
                     </div>
                     <span className="font-bold text-slate-900">{a.max_marks}</span>
                  </div>
               </div>
               <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-center gap-2">
                  View Submissions <Clock size={18} />
               </button>
            </div>
          ))
        )}
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
             <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Post Assignment</h3>
                      <p className="text-slate-500 font-medium">Fill in the details for your new academic task.</p>
                   </div>
                   <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={24} className="text-slate-400" />
                   </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assignment Title</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Lab 3: Pointer Arithmetic"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-800 transition-all"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description / Instructions</label>
                      <textarea 
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Provide detailed instructions for the assignment..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-medium text-slate-700 transition-all"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Due Date</label>
                        <input 
                          required
                          type="datetime-local" 
                          value={formData.deadline}
                          onChange={e => setFormData({...formData, deadline: e.target.value})}
                          className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-800 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Max Marks</label>
                        <input 
                          required
                          type="number" 
                          value={formData.max_marks}
                          onChange={e => setFormData({...formData, max_marks: e.target.value})}
                          className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-800 transition-all"
                        />
                      </div>
                   </div>
                   <div className="pt-6 border-t border-slate-100 flex gap-4">
                      <button 
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-4 px-6 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98]"
                      >
                         Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-4 px-6 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all active:scale-[0.98] shadow-xl shadow-violet-100 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
                         Deploy Assignment
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssignmentManagement;
