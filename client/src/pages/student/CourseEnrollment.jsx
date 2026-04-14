import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  MapPin, 
  Clock, 
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const CourseEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollStatus, setEnrollStatus] = useState({ type: '', message: '' });
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/student/courses/available');
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load course catalog. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (sectionId) => {
    setEnrollingId(sectionId);
    setEnrollStatus({ type: '', message: '' });
    try {
      await api.post('/student/enroll', { sectionId });
      setEnrollStatus({ type: 'success', message: 'Successfully enrolled in the course!' });
      // Update local state to reflect filled seats
      setCourses(courses.map(c => 
        c.section_id === sectionId ? { ...c, current_seats: c.current_seats + 1 } : c
      ));
    } catch (err) {
      setEnrollStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Enrollment failed. Seat limit may be reached.' 
      });
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-b-2 rounded-full border-primary-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Enrollment</h1>
          <p className="mt-1 text-sm text-slate-500">Browse and register for available modules.</p>
        </div>
      </div>

      {error && (
        <div className="flex p-4 text-red-700 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {enrollStatus.message && (
        <div className={`flex items-center p-4 rounded-lg border ${
          enrollStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {enrollStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 text-green-600" />
          ) : (
             <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />
          )}
          <p className="font-medium">{enrollStatus.message}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-xl border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500">No courses available for enrollment right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const isFull = course.current_seats >= course.max_seats;
            const availableSeats = course.max_seats - course.current_seats;

            return (
              <div 
                key={course.section_id} 
                className="flex flex-col overflow-hidden transition-all bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-primary-200"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2.5 py-1 font-mono text-xs font-semibold text-primary-700 bg-primary-50 rounded-md">
                      {course.course_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded-md">
                      {course.credit_hours} CH
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-lg font-bold text-slate-800 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock size={16} className="mr-2 text-slate-400" />
                      <span>{course.schedule_time}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin size={16} className="mr-2 text-slate-400" />
                      <span>{course.room || 'TBD'} • Sec {course.section_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Users size={16} className="mr-2 text-slate-400" />
                      <span>Prof. {course.faculty_name || 'Staff'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm">
                    {isFull ? (
                      <span className="font-semibold text-red-600">Section Full</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        {availableSeats} seat{availableSeats > 1 ? 's' : ''} left
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEnroll(course.section_id)}
                    disabled={isFull || enrollingId === course.section_id}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                  >
                    {enrollingId === course.section_id ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollment;
