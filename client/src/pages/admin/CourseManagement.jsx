import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, X, AlertCircle, CheckCircle2, Search } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [form, setForm] = useState({
    course_code: '', title: '', credit_hours: 3, department: '', description: '',
  });

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 3500);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch {
      setCourses([
        { course_id: '1', course_code: 'CS-101', title: 'Introduction to Computing', credit_hours: 3, department: 'Computer Science', is_active: true, total_sections: 2, total_enrolled: 45 },
        { course_id: '2', course_code: 'MA-201', title: 'Calculus II', credit_hours: 3, department: 'Mathematics', is_active: true, total_sections: 1, total_enrolled: 30 },
        { course_id: '3', course_code: 'EN-101', title: 'Academic Writing', credit_hours: 2, department: 'English', is_active: true, total_sections: 3, total_enrolled: 72 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/courses', form);
      setCourses([res.data, ...courses]);
      setShowModal(false);
      setForm({ course_code: '', title: '', credit_hours: 3, department: '', description: '' });
      showToast('success', `Course "${res.data.title}" created successfully!`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = search
    ? courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code.toLowerCase().includes(search.toLowerCase()) ||
        c.department?.toLowerCase().includes(search.toLowerCase()))
    : courses;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold border animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={22} className="text-primary-600" /> Course Catalog
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Create and manage academic courses.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by code, title or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
        />
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-1/3" />
              <div className="h-5 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-400 font-medium">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(course => (
            <div key={course.course_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg font-mono border border-primary-100">
                  {course.course_code}
                </span>
                <span className={`w-2 h-2 rounded-full mt-1.5 ${course.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 leading-snug">{course.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{course.department} • {course.credit_hours} Credit Hours</p>
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <span>{course.total_sections || 0} sections</span>
                <span>{course.total_enrolled || 0} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create New Course</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Course Code *</label>
                  <input required value={form.course_code}
                    onChange={e => setForm({ ...form, course_code: e.target.value })}
                    placeholder="CS-301"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credit Hours *</label>
                  <input required type="number" min={1} max={6} value={form.credit_hours}
                    onChange={e => setForm({ ...form, credit_hours: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
                <input required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Data Structures & Algorithms"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department *</label>
                <input required value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  placeholder="Computer Science"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Brief overview of the course…"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
