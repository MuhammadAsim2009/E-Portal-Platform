import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, ClipboardList, ChevronRight, GraduationCap, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <div 
    className={`relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`} 
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradient}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <p className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{value ?? '—'}</p>
    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
  </div>
);

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/faculty/courses'),
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg text-center font-medium shadow-sm border border-red-100">
        {error}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome back! Here's your teaching overview for this semester.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/faculty/attendance" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={18} />
            Mark Attendance
          </Link>
          <Link to="/faculty/gradebook" className="px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/20 flex items-center gap-2">
            <ClipboardList size={18} />
            Grade Book
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookOpen} label="Course Sections" value={stats?.sectionsCount} gradient="from-violet-500 to-indigo-600" delay={100} />
        <StatCard icon={Users} label="Total Students" value={stats?.studentsCount} gradient="from-blue-500 to-cyan-600" delay={200} />
        <StatCard icon={ClipboardList} label="Assignments Created" value={stats?.assignmentsCount} gradient="from-emerald-500 to-teal-600" delay={300} />
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {/* Left Column: My Courses */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
            <Link to="/faculty/courses" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors group">
              View all courses <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {courses.length === 0 ? (
                <div className="px-8 py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No schedule for today.</p>
                </div>
              ) : (
                courses.map((course, idx) => (
                  <div key={course.section_id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap size={24} className="text-violet-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold font-mono tracking-tight">
                            {course.course_code}
                          </span>
                          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Sec {course.section_name}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-lg mb-1">{course.title}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {course.schedule_time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 ml-19 sm:ml-[76px] lg:ml-0">
                      <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap">
                        <Users size={16} className="text-slate-500" /> {course.current_seats} Enrolled
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Tasks placeholder */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
           <h2 className="text-xl font-bold text-slate-800">Quick Tools</h2>
           
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
             
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10 text-slate-800"><ClipboardList size={20} className="text-violet-600" /> Pending Tasks</h3>
             <ul className="space-y-3 relative z-10">
               {(!stats?.pendingTasks || stats.pendingTasks.length === 0) ? (
                 <li className="text-sm font-medium text-slate-500 py-2">No pending tasks!</li>
               ) : (
                 stats.pendingTasks.map((task, idx) => {
                   // parse deadline to see if it's near
                   const isNear = new Date(task.deadline).getTime() - Date.now() < 3 * 86400000;
                   return (
                     <li key={task.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                       <div className={`mt-1.5 w-2 h-2 rounded-full ${isNear ? 'bg-amber-400' : 'bg-emerald-400'} flex-shrink-0`}></div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{task.title}</p>
                         <p className="text-xs text-slate-500 mt-0.5">{task.course_code} Sec {task.section_name} • Due {new Date(task.deadline).toLocaleDateString()}</p>
                       </div>
                     </li>
                   );
                 })
               )}
             </ul>
           </div>

           {/* Quick links block */}
           <div className="grid grid-cols-2 gap-4">
              <Link to="/faculty/attendance" className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-violet-300 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-100 transition-all">
                   <Calendar size={22} className="text-violet-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Attendance</span>
              </Link>
              <Link to="/faculty/gradebook" className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                   <ClipboardList size={22} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Grade Book</span>
              </Link>
           </div>
        </div>
      </div>

      {/* Bottom Section: Announcements & Guidelines */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row items-center border-b border-white/10">
            <div className="p-8 md:w-2/3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold tracking-wide uppercase mb-4">
                Important Update
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">End of Semester Grading Deadline</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Please ensure all final grades are submitted through the Grade Book module by the 15th of next month. 
                For any discrepancies, contact the IT support desk or refer to the faculty guidelines portal.
              </p>
              <button className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                View Faculty Guidelines
              </button>
            </div>
            <div className="hidden md:flex p-8 items-center justify-center md:w-1/3 opacity-20">
              <GraduationCap size={160} className="text-white" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FacultyDashboard;
