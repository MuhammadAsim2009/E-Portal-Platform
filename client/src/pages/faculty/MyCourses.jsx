import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  BookOpen, Users, Clock, MapPin, Plus, Edit2, Trash2, 
  X, CheckCircle2, AlertCircle, Info, Send 
} from 'lucide-react';
import { formatSchedule } from '../../utils/timeFormat';

const MyCourses = () => {
  usePageTitle('My Courses');
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [form, setForm] = useState({
    course_code: '', title: '', credit_hours: 3, department: '', description: '', max_seats: 50, day_of_week: '', start_time: '', end_time: '', room: ''
  });

  const [toast, setToast] = useState({ show: false, type: '', msg: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, requestsRes] = await Promise.all([
        api.get('/faculty/courses'),
        api.get('/faculty/course-requests')
      ]);
      setCourses(coursesRes.data);
      setRequests(requestsRes.data);
    } catch {
      // Mock data for demo
      setCourses([
        { section_id: '1', section_name: 'A', room: 'CS-101', schedule_time: 'Mon/Wed 9:00-10:30', max_seats: 30, current_seats: 28, course_code: 'CS-201', title: 'Data Structures', credit_hours: 3, department: 'Computer Science' },
        { section_id: '2', section_name: 'B', room: 'CS-102', schedule_time: 'Tue/Thu 11:00-12:30', max_seats: 30, current_seats: 25, course_code: 'CS-301', title: 'Algorithms', credit_hours: 3, department: 'Computer Science' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
  };

  const handleRequest = async (type, targetId = null, data = null) => {
    setSubmitting(true);
    try {
      await api.post('/faculty/course-requests', {
        type,
        targetId,
        data: data || form
      });
      showToast('success', 'Your request has been sent for administrative approval.');
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      fetchData(); // Refresh requests list
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (course) => {
    setSelectedCourse(course);
    setForm({
      section_id: course.section_id,
      course_code: course.course_code,
      title: course.title,
      credit_hours: course.credit_hours,
      department: course.department,
      description: course.description || '',
      max_seats: course.max_seats || 50,
      day_of_week: course.day_of_week || '',
      start_time: course.start_time || '',
      end_time: course.end_time || '',
      room: course.room || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[200] animate-in fade-in slide-in-from-right-8">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-200">
              <BookOpen size={24} />
            </div>
            My Courses
          </h1>
          <p className="text-slate-500 mt-2 text-[15px] font-medium max-w-lg">
            Manage your teaching load. Changes to course details require formal approval from the Registrar Office.
          </p>
        </div>
        
        <button 
          onClick={() => {
            setForm({ course_code: '', title: '', credit_hours: 3, department: '', description: '', max_seats: 50, day_of_week: '', start_time: '', end_time: '', room: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[13px] font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus size={18} /> Request New Course
        </button>
      </div>

      {/* Pending Requests Section */}
      {requests.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white">
              <Clock size={16} />
            </div>
            <h3 className="font-bold text-amber-900 tracking-tight">Active Requests ({requests.filter(r => r.status === 'pending').length} Pending)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
              <div key={req.request_id} className="bg-white border border-amber-100 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">{req.request_type.replace('COURSE_', '')}</p>
                    <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{req.request_data.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-8 animate-pulse space-y-6 shadow-sm">
              <div className="h-6 bg-slate-100 rounded-full w-1/3" />
              <div className="space-y-3">
                <div className="h-8 bg-slate-100 rounded-full w-3/4" />
                <div className="h-4 bg-slate-50 rounded-full w-1/2" />
              </div>
              <div className="pt-6 border-t border-slate-50 flex justify-between">
                <div className="h-5 bg-slate-50 rounded-full w-1/4" />
                <div className="h-5 bg-slate-50 rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
             <BookOpen size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No active courses</h3>
           <p className="text-slate-500 text-sm max-w-xs mx-auto">You don't have any sections assigned. Request a course addition to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map(course => {
            const occupancy = course.max_seats > 0 ? Math.round((course.current_seats / course.max_seats) * 100) : 0;
            return (
              <div key={course.section_id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-500 flex flex-col group relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/50 rounded-bl-[4rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-start justify-between mb-8 relative">
                  <span className="px-3 py-1 bg-violet-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-violet-200">
                    {course.course_code}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEdit(course)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[11px] font-bold flex items-center gap-2">
                    <Clock size={14} />
                    {formatSchedule(course.day_of_week, course.start_time, course.end_time)}
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold flex items-center gap-2">
                    <MapPin size={14} />
                    {course.room || 'Room TBD'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">{course.title}</h3>
                
                <div className="space-y-3.5 text-[13px] text-slate-500 mb-8 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Users size={16} />
                    </div>
                    <span>{course.current_seats} / {course.max_seats} Students Enrolled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Info size={16} />
                    </div>
                    <span>{course.department} Department</span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="mt-auto bg-slate-50 p-4 rounded-2xl mb-8">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    <span>Occupancy</span>
                    <span className={occupancy > 90 ? 'text-rose-600' : occupancy > 70 ? 'text-amber-600' : 'text-emerald-600'}>
                      {occupancy}% Full
                    </span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${occupancy > 90 ? 'bg-rose-500' : occupancy > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to={`/faculty/gradebook?section=${course.section_id}`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-violet-600 text-white rounded-2xl text-[13px] font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
                  >
                    Grade Book
                  </Link>
                  <Link
                    to={`/faculty/attendance?section=${course.section_id}`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-[13px] font-bold hover:bg-slate-200 transition-all"
                  >
                    Attendance
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white">
                  {showAddModal ? <Plus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{showAddModal ? 'Request New Course' : 'Request Course Edit'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Draft changes for administrative review.</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 text-indigo-700">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-relaxed">
                  Submitting this form will not update the course immediately. It will create a pending request for the Registrar office.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Code</label>
                  <input required value={form.course_code} onChange={e => setForm({...form, course_code: e.target.value})} placeholder="e.g. CS-401" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credit Hours</label>
                  <input required type="number" min={1} value={form.credit_hours} onChange={e => setForm({...form, credit_hours: parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Distributed Systems" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</label>
                  <input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Day(s) of Week</label>
                  <input value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})} placeholder="e.g. Mon-Wed" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End Time</label>
                  <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Room / Location</label>
                  <input value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="e.g. CS-101" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Seats (Capacity)</label>
                  <input required type="number" value={form.max_seats} onChange={e => setForm({...form, max_seats: parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Justification / Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Explain why this change is needed..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium resize-none" />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex gap-4">
               <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 py-4 text-slate-400 font-bold text-[14px]">Cancel</button>
               <button 
                 onClick={() => handleRequest(showAddModal ? 'COURSE_ADD' : 'COURSE_EDIT', showEditModal ? selectedCourse.course_id : null)}
                 disabled={submitting}
                 className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[14px] font-black hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-100"
               >
                 <Send size={18} />
                 {submitting ? 'Submitting...' : 'Submit Request'}
               </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Request Deletion?</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 px-4">
                You are requesting to remove "{selectedCourse?.title}" from the curriculum. This will be sent to the admin for final approval.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleRequest('COURSE_DELETE', selectedCourse.course_id, selectedCourse)}
                  disabled={submitting}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[14px] font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
                >
                  Confirm Delete Request
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 text-slate-400 font-bold text-[14px] hover:text-slate-900 transition-all"
                >
                  Cancel
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;

