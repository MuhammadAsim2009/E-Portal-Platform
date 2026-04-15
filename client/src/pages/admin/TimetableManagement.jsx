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
  Plus
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
    
    try {
      await api.patch(`/admin/sections/${selectedSection.section_id}`, data);
      setShowEditModal(false);
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      await api.post('/admin/sections', data);
      setShowAddModal(false);
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Creation failed');
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
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
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
          onClick={() => setShowAddModal(true)}
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
                      <div className="font-bold text-sm whitespace-nowrap">
                        {section.day_of_week ? `${section.day_of_week} ${section.start_time?.slice(0,5)}` : 'Unscheduled'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedSection(section); setShowEditModal(true); }}
                className="w-full py-3.5 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 font-bold text-[13px] transition-all flex items-center justify-center gap-2"
              >
                Assemble Schedule <ChevronRight size={16} />
              </button>
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assign Faculty</label>
                <select 
                  name="faculty_id" 
                  defaultValue={selectedSection.faculty_id}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                >
                  <option value="">Select Faculty (Optional)</option>
                  {faculty.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Room</label>
                  <input 
                    name="room" 
                    defaultValue={selectedSection.room}
                    placeholder="e.g. Lab 402"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Day of Week</label>
                  <select 
                    name="day_of_week" 
                    defaultValue={selectedSection.day_of_week}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                  >
                    <option value="">Select Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
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
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
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
                       <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Course</label>
                <select 
                  name="course_id" 
                  required 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.title}</option>
                  ))}
                </select>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Section Name</label>
                  <input 
                    name="section_name" 
                    placeholder="e.g. A"
                    required 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px] w-full" 
                  />
                </div>
              </div>
 
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assign Faculty</label>
                <select 
                  name="faculty_id" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                >
                  <option value="">Select Faculty (Optional)</option>
                  {faculty.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Room</label>
                  <input 
                    name="room" 
                    placeholder="e.g. Lab 402"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Day of Week</label>
                  <select 
                    name="day_of_week" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl appearance-none font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]"
                  >
                    <option value="">Select Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End Time</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-[13px]" 
                  />
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
    </div>
  );
};

export default TimetableManagement;
