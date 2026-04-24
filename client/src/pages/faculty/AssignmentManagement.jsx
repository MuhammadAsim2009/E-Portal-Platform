import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Plus, Trash2, Calendar, Clock, BarChart2, X, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const AssignmentManagement = () => {
  usePageTitle('Assignment Management');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
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
        const courseData = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        setCourses(courseData);
        
        const urlSection = searchParams.get('section');
        if (courseData.length > 0) {
          // If URL has a section and it exists in our courses, use it
          if (urlSection && courseData.some(c => c.section_id === urlSection)) {
            setSelectedSection(urlSection);
          } else {
            // Default to first course if no valid URL section
            setSelectedSection(courseData[0].section_id);
          }
        }
      })
      .catch(() => {
        toast.error("Failed to load courses");
      });
  }, []); // Initial load only

  const fetchAssignments = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const res = await api.get(`/faculty/sections/${selectedSection}/assignments`);
      setAssignments(Array.isArray(res.data) ? res.data : (res.data.assignments || []));
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSection) {
      fetchAssignments();
      // Only update search params if it's different to avoid redundant history entries
      if (searchParams.get('section') !== selectedSection) {
        setSearchParams({ section: selectedSection }, { replace: true });
      }
    }
  }, [selectedSection]);

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/faculty/assignments/${showDeleteModal.assignment_id}`);
      toast.success("Assignment deleted successfully");
      setShowDeleteModal(null);
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Assignment Management</h1>
          <p className="text-slate-500 font-medium">Create and manage academic tasks for your students</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
            >
              {courses.map(c => (
                <option key={c.section_id} value={c.section_id}>
                  {c.course_code} — Sec {c.section_name}
                </option>
              ))}
            </select>
            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-500/25"
          >
            <Plus size={20} />
            <span>New Assignment</span>
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
            <div key={a.assignment_id} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-2xl hover:border-violet-200 transition-all group relative overflow-hidden flex flex-col h-full">
               <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowDeleteModal(a)} 
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 bg-white shadow-sm border border-slate-100"
                    title="Delete Assignment"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
               
               <div className="mb-6">
                  <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black tracking-widest rounded-lg border border-violet-100 uppercase">
                     {a.submission_type || 'Manual'} Task
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-4 leading-tight">{a.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2 min-h-[40px]">{a.description || 'No description provided.'}</p>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-100 mt-auto">
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

               <button 
                  onClick={() => navigate(`/faculty/assignments/${a.assignment_id}/submissions`)}
                  className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200"
               >
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
             <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Assignment?</h3>
                <p className="text-slate-500 font-medium mb-8">
                   Are you sure you want to delete <span className="text-slate-900 font-bold">"{showDeleteModal.title}"</span>? 
                   This action cannot be undone and all student submissions will be permanently lost.
                </p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowDeleteModal(null)}
                     className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                   >
                      Cancel
                   </button>
                   <button 
                     onClick={handleDelete}
                     disabled={isSubmitting}
                     className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                   >
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={18} />}
                      Delete Now
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
