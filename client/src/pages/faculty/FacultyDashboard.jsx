import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, ClipboardList, ChevronRight, GraduationCap } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-1">{value ?? '—'}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
  </div>
);

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/faculty/courses'),
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data.slice(0, 3));
      } catch {
        setStats({ sectionsCount: 4, studentsCount: 87, assignmentsCount: 12 });
        setCourses([
          { section_id: '1', course_code: 'CS-201', title: 'Data Structures', section_name: 'A', schedule_time: 'Mon/Wed 9:00-10:30', current_seats: 28 },
          { section_id: '2', course_code: 'CS-301', title: 'Algorithms', section_name: 'B', schedule_time: 'Tue/Thu 11:00-12:30', current_seats: 25 },
        ]);
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Your teaching overview for this semester.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={BookOpen} label="Course Sections" value={stats?.sectionsCount} color="bg-violet-600" />
        <StatCard icon={Users} label="Total Students" value={stats?.studentsCount} color="bg-primary-600" />
        <StatCard icon={ClipboardList} label="Assignments Created" value={stats?.assignmentsCount} color="bg-emerald-600" />
      </div>

      {/* My Courses Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Your Sections This Semester</h2>
          <Link to="/faculty/courses" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {courses.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400">No courses assigned.</p>
          ) : (
            courses.map(course => (
              <div key={course.section_id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{course.course_code} — Sec {course.section_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{course.title} • {course.schedule_time}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {course.current_seats} students
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
