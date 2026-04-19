import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, Plus, X, AlertCircle, CheckCircle2, Search, 
  Layers, Users, Star, MoreHorizontal, GraduationCap, Clock,
  Hash, ChevronRight, LayoutGrid, Trash2, Edit3, Trash, Power
} from 'lucide-react';
const CourseManagement = () => {
  usePageTitle('Course Management');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [form, setForm] = useState({
    course_code: '', title: '', credit_hours: 3, department: '', description: '', max_seats: 50, is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastTimer, setToastTimer] = useState(null);
  const showToast = (type, msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ show: true, type, msg });
    const timer = setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
    setToastTimer(timer);
  };
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch {
      setCourses([
        { course_id: '550e8400-e29b-41d4-a716-446655440001', course_code: 'CS-101', title: 'Introduction to Computing', credit_hours: 3, department: 'Computer Science', is_active: true, total_sections: 2, total_enrolled: 45 },
        { course_id: '550e8400-e29b-41d4-a716-446655440002', course_code: 'MA-201', title: 'Calculus II', credit_hours: 3, department: 'Mathematics', is_active: true, total_sections: 1, total_enrolled: 30 },
        { course_id: '550e8400-e29b-41d4-a716-446655440003', course_code: 'EN-101', title: 'Academic Writing', credit_hours: 2, department: 'English', is_active: true, total_sections: 3, total_enrolled: 72 },
        { course_id: '550e8400-e29b-41d4-a716-446655440004', course_code: 'PH-101', title: 'General Physics I', credit_hours: 4, department: 'Physics', is_active: true, total_sections: 2, total_enrolled: 38 },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };
  useEffect(() => { fetchCourses(); }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/courses', form);
      setCourses([res.data, ...courses]);
      showToast('success', `Course "${res.data.title}" created successfully!`);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/courses/${editingId}`, form);
      setCourses(courses.map(c => c.course_id === editingId ? res.data : c));
      showToast('success', `Course "${res.data.title}" updated successfully!`);
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setEditingId(null);
    setForm({ course_code: '', title: '', credit_hours: 3, department: '', description: '', max_seats: 50 });
  };
  const handleEdit = (course) => {
    setForm({
      course_code: course.course_code,
      title: course.title,
      credit_hours: course.credit_hours,
      department: course.department,
      description: course.description || '',
      max_seats: course.max_seats || 50,
      is_active: course.is_active
    });
    setEditingId(course.course_id);
    setShowEditModal(true);
  };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses(courses.filter(c => c.course_id !== id));
      showToast('success', 'Course deleted successfully');
    } catch (err) {
      showToast('error', 'Failed to delete course');
    }
  };
  const filtered = search
    ? courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code.toLowerCase().includes(search.toLowerCase()) ||
        c.department?.toLowerCase().includes(search.toLowerCase()))
    : courses;
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className={`flex items-center gap-4 pl-4 pr-3 py-3 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-emerald-500/95 border-emerald-400/50 text-white' 
              : 'bg-rose-500/95 border-rose-400/50 text-white'
          }`}>
            <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium opacity-80 uppercase tracking-wider mb-0.5">
                {toast.type === 'success' ? 'Success' : 'Attention Needed'}
              </p>
              <p className="text-sm font-semibold leading-tight">{toast.msg}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <X size={16} className="opacity-60 group-hover:opacity-100" />
            </button>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 rounded-full bg-white/30 animate-progress origin-left`} style={{ animationDuration: '5000ms' }}></div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
              <BookOpen size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Courses</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Design and structure academic paths across all departments.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} /> New Curriculum Course
        </button>
      </div>
      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search curricula by code, title or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-[13px] font-medium transition-all focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3 px-2">
           <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
             <LayoutGrid size={20} />
           </button>
           <button className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
             <MoreHorizontal size={20} />
           </button>
        </div>
      </div>
      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] p-8 space-y-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-1/3" />
              <div className="space-y-3">
                <div className="h-6 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-50 rounded-full w-1/2" />
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <div className="h-4 bg-slate-50 rounded-full w-1/4" />
                <div className="h-4 bg-slate-50 rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center glass-card rounded-[3rem] border-dashed">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <BookOpen size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 brand-font mb-2">No Courses Found</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(course => (
            <div key={course.course_id} className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-all duration-300 group flex flex-col relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                  {course.course_code}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                  course.is_active 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                   <span className={`w-1.5 h-1.5 rounded-full ${course.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                   {course.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors brand-font">
                {course.title}
              </h3>
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <GraduationCap size={14} className="text-slate-400" />
                  {course.department}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock size={14} className="text-slate-400" />
                  {course.credit_hours} CH
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                  <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" />
                    {course.total_enrolled || 0}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
                  <p className="text-xl font-bold text-slate-900 flex items-center justify-end gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {course.max_seats || 50}
                  </p>
                </div>
              </div>
              {/* Action Buttons at the bottom */}
              <div className="mt-6 flex items-center gap-3">
                <button 
                  onClick={() => handleEdit(course)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[12px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100 hover:border-indigo-500"
                >
                  <Edit3 size={14} /> Edit Parameters
                </button>
                <button 
                  onClick={() => { setDeleteId(course.course_id); setShowDeleteModal(true); }}
                  className="px-4 py-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all border border-slate-100 hover:border-rose-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trash size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 brand-font mb-4">Delete Course?</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 px-4">
                This course will be permanently removed from the system. You cannot undo this action.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    await handleDelete(deleteId);
                    setShowDeleteModal(false);
                  }}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[14px] font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95"
                >
                  Delete permanently
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 text-slate-400 font-bold text-[14px] hover:text-slate-900 transition-all"
                >
                  No, keep it
                </button>
              </div>
           </div>
        </div>
      )}
      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 transition-all">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
                  <Plus size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Course</h2>
                   <p className="text-slate-500 text-[13px] font-medium">Create a new course in the curriculum.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Code</label>
                    <input required value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} placeholder="e.g. CS-101" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credit Hours</label>
                    <input required type="number" min={1} max={6} value={form.credit_hours || ''} onChange={e => setForm({...form, credit_hours: e.target.value === '' ? '' : parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Introduction to AI" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</label>
                    <input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. Computer Science" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Seats</label>
                    <input required type="number" min={1} value={form.max_seats || ''} onChange={e => setForm({...form, max_seats: e.target.value === '' ? '' : parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief overview..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-[13px]">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 transition-all">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
                  <Edit3 size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Course</h2>
                   <p className="text-slate-500 text-[13px] font-medium">Update the course details.</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Code</label>
                    <input required value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credit Hours</label>
                    <input required type="number" min={1} max={6} value={form.credit_hours || ''} onChange={e => setForm({...form, credit_hours: e.target.value === '' ? '' : parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</label>
                    <input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Seats</label>
                    <input required type="number" min={1} value={form.max_seats || ''} onChange={e => setForm({...form, max_seats: e.target.value === '' ? '' : parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium resize-none" />
                </div>
                <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                  form.is_active 
                  ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' 
                  : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    form.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <Power size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-slate-800">Available Status</p>
                    <p className={`text-[12px] font-medium ${form.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {form.is_active ? 'Course is active and visible to students' : 'Course is archived and hidden'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setForm({...form, is_active: !form.is_active})}
                    className={`w-14 h-7 rounded-full transition-all relative border-2 ${
                      form.is_active 
                        ? 'bg-emerald-500 border-emerald-400' 
                        : 'bg-slate-200 border-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-spring ${
                      form.is_active ? 'left-[30px]' : 'left-[2px]'
                    }`} />
                  </button>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-[13px]">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 disabled:opacity-50">
                    {submitting ? 'Updating...' : 'Save Changes'}
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
export default CourseManagement;
