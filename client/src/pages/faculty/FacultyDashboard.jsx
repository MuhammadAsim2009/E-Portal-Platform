import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  BookOpen, Users, ClipboardList, ChevronRight, GraduationCap, 
  Clock, Calendar, CheckCircle2, ArrowRight, CalendarCheck, 
  LayoutDashboard, BarChart3, TrendingUp, AlertTriangle, MessageSquare
} from 'lucide-react';
import { formatSchedule } from '../../utils/timeFormat';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import useAuthStore from '../../store/authStore';

const StatCard = ({ icon: Icon, label, value, gradient, delay, to }) => {
  const CardContent = (
    <>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradient}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className="text-white" />
        </div>
        {to && <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors" />}
      </div>
      <p className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    </>
  );
  const className = `relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 group`;
  if (to) {
    return (
      <Link to={to} className={className} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
        {CardContent}
      </Link>
    );
  }
  return (
    <div className={className} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      {CardContent}
    </div>
  );
};

const FacultyDashboard = () => {
  usePageTitle('Faculty Dashboard');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { siteSettings } = useAuthStore();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/faculty/courses'),
        ]);
        setStats(statsRes.data);
        const courseData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.courses || []);
        setCourses(courseData.slice(0, 3));
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

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome to {siteSettings?.siteName || 'E-Portal'}! Here's your teaching overview for this semester.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/faculty/attendance" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm">
            <CalendarCheck size={18} />
            Post Attendance
          </Link>
          <Link to="/faculty/gradebook" className="px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/20 flex items-center gap-2">
            <ClipboardList size={18} />
            Grade Book
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <StatCard icon={BookOpen} label="Course Sections" value={stats?.sectionsCount} gradient="from-violet-500 to-indigo-600" delay={100} to="/faculty/courses" />
        <StatCard icon={Users} label="Total Students" value={stats?.studentsCount} gradient="from-blue-500 to-cyan-600" delay={200} />
        <StatCard icon={ClipboardList} label="Assignments Created" value={stats?.assignmentsCount} gradient="from-emerald-500 to-teal-600" delay={300} to="/faculty/assignments" />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        {/* Grade Distribution */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-600" /> Grade Distribution
            </h2>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">All Sections</span>
          </div>
          <div className="h-64 w-full">
            {stats?.gradeDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">No grades published yet.</div>
            )}
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" /> Attendance Trends
            </h2>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Last 7 Sessions</span>
          </div>
          <div className="h-64 w-full">
            {stats?.attendanceTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => new Date(val).toLocaleDateString([], {month: 'short', day: 'numeric'})} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} unit="%" />
                  <Tooltip 
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">No attendance data recorded yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
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
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> 
                            {formatSchedule(course.day_of_week, course.start_time, course.end_time)}
                          </span>
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

        {/* Right Column: Submission Stats & Tasks */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>


           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><Clock size={20} className="text-violet-600" /> Pending Tasks</h3>
             <ul className="space-y-3">
               {(!stats?.pendingTasks || stats.pendingTasks.length === 0) ? (
                 <li className="text-sm font-medium text-slate-500 py-2 text-center">No pending tasks!</li>
               ) : (
                 stats.pendingTasks.map((task, idx) => {
                   const isNear = new Date(task.deadline).getTime() - Date.now() < 3 * 86400000;
                   return (
                     <li key={task.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                       <div className={`mt-1.5 w-2 h-2 rounded-full ${isNear ? 'bg-amber-400' : 'bg-emerald-400'} flex-shrink-0`}></div>
                       <div className="flex-1">
                         <p className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{task.title}</p>
                         <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold">{task.course_code} Sec {task.section_name} • Due {new Date(task.deadline).toLocaleDateString()}</p>
                       </div>
                       <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 mt-1" />
                     </li>
                   );
                 })
               )}
             </ul>
           </div>
        </div>
      </div>

      {/* Bottom Section: Reports */}
      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center gap-6 group hover:border-emerald-300 transition-all shadow-sm">
           <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <BarChart3 size={28} />
           </div>
           <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Performance Audit</h3>
              <p className="text-slate-500 text-sm mt-1">Generate detailed PDF reports of class performance, attendance consistency, and grade trends.</p>
           </div>
           <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
