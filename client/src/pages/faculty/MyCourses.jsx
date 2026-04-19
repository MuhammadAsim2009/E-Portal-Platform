import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, Clock, MapPin } from 'lucide-react';
const MyCourses = () => {
  usePageTitle('My Courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data))
      .catch(() => setCourses([
        { section_id: '1', section_name: 'A', room: 'CS-101', schedule_time: 'Mon/Wed 9:00-10:30', max_seats: 30, current_seats: 28, course_code: 'CS-201', title: 'Data Structures', credit_hours: 3, department: 'Computer Science' },
        { section_id: '2', section_name: 'B', room: 'CS-102', schedule_time: 'Tue/Thu 11:00-12:30', max_seats: 30, current_seats: 25, course_code: 'CS-301', title: 'Algorithms', credit_hours: 3, department: 'Computer Science' },
        { section_id: '3', section_name: 'A', room: 'MT-201', schedule_time: 'Mon/Wed/Fri 8:00-9:00', max_seats: 40, current_seats: 34, course_code: 'MA-201', title: 'Calculus II', credit_hours: 3, department: 'Mathematics' },
      ]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen size={22} className="text-violet-600" /> My Courses
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">All sections assigned to you this semester.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded-full w-1/3" />
              <div className="h-5 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map(course => {
            const occupancy = Math.round((course.current_seats / course.max_seats) * 100);
            return (
              <div key={course.section_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg font-mono border border-violet-100">
                    {course.course_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    Sec {course.section_name}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-3 leading-snug">{course.title}</h3>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{course.schedule_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span>Room {course.room} • {course.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{course.current_seats} / {course.max_seats} students</span>
                  </div>
                </div>
                {/* Occupancy bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Occupancy</span>
                    <span>{occupancy}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${occupancy > 85 ? 'bg-red-500' : occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/faculty/gradebook?section=${course.section_id}`}
                    className="px-3 py-2 text-xs font-semibold text-center bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors border border-violet-100"
                  >
                    Grade Book
                  </Link>
                  <Link
                    to={`/faculty/attendance?section=${course.section_id}`}
                    className="px-3 py-2 text-xs font-semibold text-center bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    Attendance
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MyCourses;
