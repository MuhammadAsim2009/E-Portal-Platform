import React from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Users, 
  User, 
  Clock,
  Check
} from 'lucide-react';

const StudentExplore = ({ 
  availableCourses, 
  searchQuery, 
  setSearchQuery, 
  swappingFrom, 
  setSwappingFrom, 
  handleEnroll, 
  conflictError, 
  setConflictError,
  enrolled
}) => {
  const [selectedDept, setSelectedDept] = React.useState('All Departments');

  const departments = ['All Departments', ...new Set(availableCourses.map(c => c.department).filter(Boolean))];

  const filteredCourses = availableCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (c.instructor_name && c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = selectedDept === 'All Departments' || c.department === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Courses</h2>
          <p className="text-sm text-slate-500 mt-1">Explore upcoming modules and manage your registration.</p>
        </div>
      </div>

      {/* Swap Mode Banner */}
      {swappingFrom && (
        <div className="mb-8 p-5 bg-indigo-600 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-indigo-100 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <RefreshCw size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold tracking-tight">Replacement Mode</h3>
              <p className="text-indigo-100 text-xs">Select a course to replace {swappingFrom.course_code}</p>
            </div>
          </div>
          <button 
            onClick={() => setSwappingFrom(null)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Conflict Display */}
      {conflictError && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 animate-in shake duration-500">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{conflictError}</p>
          <button onClick={() => setConflictError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X size={18} /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search courses, instructors, or codes..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-bold text-slate-600"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(() => {
          // Group sections by course_code to show one card per course
          const groupedCourses = filteredCourses.reduce((acc, current) => {
            if (!acc[current.course_code]) {
              acc[current.course_code] = {
                ...current,
                sections: [current]
              };
            } else {
              acc[current.course_code].sections.push(current);
            }
            return acc;
          }, {});

          return Object.values(groupedCourses).map(course => {
            // Check if student is enrolled in ANY section of this course
            const courseEnrollments = enrolled.filter(e => 
              course.sections.some(s => String(s.section_id).toLowerCase() === String(e.section_id).toLowerCase())
            );
            
            const isEnrolled = courseEnrollments.some(e => e.status?.toLowerCase() === 'enrolled');
            const isPending = courseEnrollments.some(e => e.status?.toLowerCase() === 'pending');
            
            // A course is "full" only if ALL its sections are full
            const allSectionsFull = course.sections.every(s => Number(s.current_seats) >= s.max_seats);
            
            // Get total available slots across all sections
            const totalMax = course.sections.reduce((sum, s) => sum + Number(s.max_seats), 0);
            const totalCurrent = course.sections.reduce((sum, s) => sum + Number(s.current_seats), 0);

            return (
              <div key={course.course_code} className={`p-6 bg-white border rounded-2xl transition-all flex flex-col justify-between group h-full hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/40 ${ (isEnrolled || isPending) ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-100'}`}>
                <div>
                  <div className="flex justify-between items-start mb-5">
                     <div className="flex flex-col gap-1.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider w-fit">{course.department}</span>
                        <span className="text-xs font-black text-indigo-600 tracking-tight">PKR {course.enrollment_fee || '0.00'}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${allSectionsFull ? 'text-rose-500' : 'text-slate-400'}`}>
                           {totalMax - totalCurrent} / {totalMax}
                        </span>
                        <span className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-0.5">Total Available Slots</span>
                     </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">{course.course_code}</h3>
                  <h4 className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{course.title}</h4>
                  
                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors"><Users size={14} /></div>
                        <span className="text-xs font-semibold">{course.sections.length} Active Sections</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors"><Clock size={14} /></div>
                        <span className="text-xs font-semibold">Multiple Schedules Available</span>
                     </div>
                  </div>
                </div>

                <button 
                  onClick={() => !isEnrolled && !isPending && !allSectionsFull && handleEnroll(course)}
                  disabled={isEnrolled || isPending || allSectionsFull}
                  className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                    isEnrolled 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                      : isPending
                      ? 'bg-amber-50 text-amber-600 border border-amber-100 cursor-default'
                      : allSectionsFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200 hover:shadow-indigo-100 hover:-translate-y-0.5'
                  }`}
                >
                  {isEnrolled ? (
                    <><Check size={14} /> Enrolled</>
                  ) : isPending ? (
                    <><RefreshCw size={14} className="animate-spin-slow" /> Pending Approval</>
                  ) : allSectionsFull ? (
                    'Course Full'
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default StudentExplore;
