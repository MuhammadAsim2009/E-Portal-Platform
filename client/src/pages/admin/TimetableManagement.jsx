import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Calendar, 
  UserPlus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Search,
  ChevronRight,
  MoreVertical,
  Eye,
  Trash2,
  User,
  Plus,
  X,
  Edit2
} from 'lucide-react';

const TimetableManagement = () => {
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [timeError, setTimeError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchSections = async () => {
    try {
      const res = await api.get('/admin/sections');
      setSections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/admin/faculty');
      setFaculty(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchFaculty();
    fetchCourses();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.day_of_week = selectedDays.join(', ');

    if (data.start_time >= data.end_time) {
      setTimeError('End time must be after start time');
      return;
    }
    setTimeError('');

    if (selectedDays.length === 0) {
      showToast('error', 'Select at least one day');
      return;
    }
    
    try {
      await api.patch(`/admin/sections/${selectedSection.section_id}`, data);
      showToast('success', 'Schedule updated successfully');
      setShowEditModal(false);
      fetchSections();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.day_of_week = selectedDays.join(', ');

    if (data.start_time >= data.end_time) {
      setTimeError('End time must be after start time');
      return;
    }
    setTimeError('');

    if (selectedDays.length === 0) {
      showToast('error', 'Select at least one day');
      return;
    }
    
    try {
      await api.post('/admin/sections', data);
      showToast('success', 'New entry created successfully');
      setShowAddModal(false);
      fetchSections();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Creation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/sections/${selectedSection.section_id}`);
      showToast('success', 'Section deleted successfully');
      setShowDeleteModal(false);
      fetchSections();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Deletion failed');
    }
  };

  const fetchEligibleStudents = async (id) => {
    try {
      const res = await api.get(`/admin/sections/${id}/eligible-students`);
      setEligibleStudents(res.data);
    } catch (err) {
      console.error('Fetch Eligible Students Error:', err);
    }
  };

  const fetchStudents = async (id) => {
    try {
      const res = await api.get(`/admin/sections/${id}/students`);
      setSectionStudents(res.rows || res.data || []);
      fetchEligibleStudents(id);
    } catch (err) {
      console.error('Fetch Students Error:', err);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollLoading(true);
    const student_id = e.target.student_id.value;
    try {
      await api.post(`/admin/sections/${selectedSection.section_id}/enroll`, { student_id });
      showToast('success', 'Student enrolled successfully');
      e.target.reset();
      fetchStudents(selectedSection.section_id);
      fetchSections(); // refresh seat count
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  const filteredSections = sections.filter(s => 
    s.course_code.toLowerCase().includes(search.toLowerCase()) || 
    s.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const metrics = {
    total: sections.length,
    unassigned: sections.filter(s => !s.faculty_id).length,
    occupancy: Math.round((sections.reduce((acc, s) => acc + (s.current_seats || 0), 0) / sections.reduce((acc, s) => acc + (s.max_seats || 0), 1)) * 100)
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative">
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
              <Calendar size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Timetable</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-md text-sm">Orchestrate faculty assignments and optimize academic facility usage.</p>
        </div>
        <button
          onClick={() => {
            setSelectedDays([]);
            setTimeError('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-semibold hover:bg-indigo-700 transition-all shadow-sm flex-shrink-0"
        >
          <Plus size={18} /> Add Time Table
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {[
          { label: 'Sections', val: metrics.total, icon: <Users size={16} />, color: 'indigo' },
          { label: 'Unassigned', val: metrics.unassigned, icon: <AlertCircle size={16} />, color: 'rose' },
          { label: 'Occupancy', val: `${metrics.occupancy}%`, icon: <CheckCircle2 size={16} />, color: 'emerald' }
        ].map((stat, i) => {
          const colorMap = {
            indigo: 'bg-indigo-50/50 border-indigo-100 text-indigo-600',
            rose: 'bg-rose-50/50 border-rose-100 text-rose-600',
            emerald: 'bg-emerald-50/50 border-emerald-100 text-emerald-600'
          };
          const colors = colorMap[stat.color] || colorMap.indigo;
          
          return (
            <div key={i} className={`${colors} px-5 py-4 rounded-2xl border min-w-[150px] shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <div className="opacity-60">{stat.icon}</div>
              </div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search by course or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-[13px] font-medium transition-all focus:bg-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <div key={section.section_id} className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-7 transition-all hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5">
              {!section.faculty_id ? (
                <div className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={10} /> Unassigned
                </div>
              ) : (
                <button className="text-slate-300 hover:text-slate-400 transition-colors p-1">
                  <MoreVertical size={18} />
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{section.course_code}</div>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{section.course_title}</h3>
                <div className="text-slate-400 font-semibold text-[11px] mt-0.5">Section {section.section_name}</div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Faculty</div>
                    <div className="font-bold text-sm">{section.faculty_name || 'Unassigned'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Room</div>
                      <div className="font-bold text-sm">{section.room || 'TBD'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule</div>
                      <div className="font-bold text-sm leading-tight">
                        {section.day_of_week ? `${section.day_of_week.split(', ').map(d => d.slice(0,3)).join(', ')} @ ${section.start_time?.slice(0,5)}` : 'Unscheduled'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { 
                  setSelectedSection(section); 
                  fetchStudents(section.section_id);
                  setShowViewModal(true); 
                }}
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-slate-800"
              >
                <Eye size={16} /> View Details
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { 
                    setSelectedSection(section); 
                    setSelectedDays(section.day_of_week ? section.day_of_week.split(', ') : []);
                    setTimeError('');
                    setShowEditModal(true); 
                  }}
                  className="py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-[13px] transition-all flex items-center justify-center gap-2 border border-transparent hover:border-indigo-100"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => { 
                    setSelectedSection(section); 
                    setShowDeleteModal(true); 
                  }}
                  className="py-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[13px] transition-all flex items-center justify-center gap-2 border border-transparent hover:border-rose-100"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Schedule Assembly</h2>
                <p className="text-slate-500 font-medium text-[13px] mt-0.5">{selectedSection.course_title} • {selectedSection.section_name}</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Schedule Days (Multi-select)</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                        selectedDays.includes(d)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assign Faculty</label>
                <div className="relative">
                  <select 
                    name="faculty_id" 
                    required
                    defaultValue={selectedSection.faculty_id}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map(f => (
                      <option key={f.faculty_id} value={f.faculty_id}>{f.name} — {f.department}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Room</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="room" 
                      required
                      defaultValue={selectedSection.room}
                      placeholder="e.g. Lab 402"
                      className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Section Status</label>
                  <div className="px-5 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl font-bold text-indigo-600 text-[13px] flex items-center gap-2">
                    <CheckCircle2 size={16} /> Validated Entry
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    defaultValue={selectedSection.start_time?.slice(0,5)}
                    required 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End Time</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    defaultValue={selectedSection.end_time?.slice(0,5)}
                    required 
                    className={`w-full px-5 py-3 bg-slate-50 border rounded-xl font-medium focus:ring-4 text-[13px] transition-all ${
                      timeError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5 text-rose-900 bg-rose-50/30' : 'border-slate-100 focus:border-indigo-500 focus:ring-indigo-500/5 text-slate-900'
                    }`} 
                  />
                  {timeError && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 text-center">{timeError}</p>}
                </div>
              </div>
 
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-xl p-8 border border-slate-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">New Entry</h2>
                <p className="text-slate-500 font-medium text-[13px] mt-0.5">Create a new section and assign its schedule.</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
               <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Course</label>
                <div className="relative">
                  <select 
                    name="course_id" 
                    required 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                  >
                    <option value="">Select Course</option>
                    {courses.filter(c => c.is_active).map(c => (
                      <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.title}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Section Name</label>
                  <input 
                    name="section_name" 
                    placeholder="e.g. A"
                    required 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assign Faculty</label>
                  <div className="relative">
                    <select 
                      name="faculty_id" 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                    >
                      <option value="">Select Faculty</option>
                      {faculty.map(f => (
                        <option key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

               <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Schedule Days</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                        selectedDays.includes(d)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Room</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="room" 
                      required
                      placeholder="e.g. Lab 402"
                      className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start</label>
                    <input type="time" name="start_time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[13px]" />
                  </div>
                  <div className="space-y-2 flex-1 relative">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End</label>
                    <input 
                      type="time" 
                      name="end_time" 
                      required 
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-[13px] transition-all ${
                        timeError ? 'border-rose-300 focus:ring-rose-500/5 text-rose-900 bg-rose-50/30' : 'border-slate-100 focus:ring-indigo-500/5'
                      }`} 
                    />
                    {timeError && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 text-center">{timeError}</p>}
                  </div>
                </div>
              </div>
 
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-[13px] hover:bg-slate-800 transition-all shadow-sm">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Eye size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedSection.course_title}</h2>
                  <p className="text-indigo-600 font-bold text-sm">Section {selectedSection.section_name} • {selectedSection.course_code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Clock size={16} />, label: 'Schedule', val: selectedSection.day_of_week || 'N/A', sub: `${selectedSection.start_time?.slice(0,5)} - ${selectedSection.end_time?.slice(0,5)}` },
                  { icon: <MapPin size={16} />, label: 'Location', val: selectedSection.room || 'TBA', sub: 'Assigned Venue' },
                  { icon: <User size={16} />, label: 'Faculty', val: selectedSection.faculty_name || 'Unassigned', sub: 'Lead Instructor' }
                ].map((info, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="text-indigo-600 mb-2 opacity-60">{info.icon}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</div>
                    <div className="text-sm font-bold text-slate-900 line-clamp-1">{info.val}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{info.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Enrolled Students 
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black">{sectionStudents.length}</span>
                  </h3>
                  <div className="text-[11px] font-bold text-slate-400 italic">Capacity: {selectedSection.current_seats}/{selectedSection.max_seats}</div>
                </div>

                <form onSubmit={handleEnroll} className="flex gap-2">
                  <div className="relative flex-1">
                    <UserPlus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      name="student_id"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a student to enroll...</option>
                      {eligibleStudents.map((s) => (
                        <option key={s.student_id} value={s.student_id}>
                          {s.full_name} ({s.admission_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={enrollLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[13px] hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 shrink-0"
                  >
                    {enrollLoading ? 'Adding...' : <><Plus size={16} /> Enroll</>}
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  {sectionStudents.length > 0 ? (
                    sectionStudents.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{s.full_name}</div>
                            <div className="text-[11px] font-medium text-slate-500">ID: {s.admission_id}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">Active</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 italic text-slate-400 text-sm">
                      No students enrolled in this shift yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-xl p-8 border border-slate-200 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
              This will permanently delete <span className="text-slate-900 font-bold">Section {selectedSection.section_name}</span>. 
              This action cannot be undone and will affect all enrolled students.
            </p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                className="flex-[2] px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[14px] hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Yes, Delete it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
