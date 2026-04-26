import React from 'react';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  Book, 
  User, 
  Clock, 
  X, 
  RefreshCw, 
  Calendar 
} from 'lucide-react';

const StudentCourses = ({ 
  enrolled, 
  handleDownloadTimetable, 
  handleDrop, 
  setSwappingFrom, 
  setActiveTab, 
  handleExportICS 
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Academic Modules</h2>
            <p className="text-xs text-slate-500 mt-1">Manage your active enrollments and academic schedule.</p>
          </div>
          <button 
            onClick={handleDownloadTimetable}
            className="flex items-center gap-2.5 py-3 px-6 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
          >
            <Download size={16} /> Export Timetable PDF
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled.map(course => (
            <div key={course.section_id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-100 transition-all group">
               <div className="flex items-center justify-between mb-6">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Book size={20} />
                 </div>
                 <span className="px-2 py-0.5 bg-white border border-slate-100 text-[8px] font-bold text-slate-400 rounded uppercase tracking-widest">
                    {course.credit_hours} Credits
                 </span>
               </div>
               <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{course.title}</h3>
               <p className="text-[10px] font-bold text-indigo-600 mb-6 tracking-widest uppercase">{course.course_code}</p>
               
               <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <User size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructor</span>
                        <span className="text-xs font-bold text-slate-700">{course.instructor_name}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <Clock size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</span>
                        <span className="text-[11px] font-black text-slate-700 uppercase">
                          {course.day_of_week} | {course.start_time} - {course.end_time}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="mt-8 flex gap-2">
                  <button 
                    onClick={() => toast.success('Initializing learning environment... module content view coming soon!', {
                      icon: '📚',
                      style: {
                        borderRadius: '1rem',
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }
                    })}
                    className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-100 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Book size={14} /> View Module
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDrop(course)}
                      className="p-4 bg-white text-rose-500 rounded-2xl border border-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm flex items-center justify-center"
                      title="Withdraw"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => { setSwappingFrom(course); setActiveTab('explore'); }}
                      className="p-4 bg-white text-amber-500 rounded-2xl border border-slate-100 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all shadow-sm flex items-center justify-center"
                      title="Swap Section"
                    >
                      <RefreshCw size={18} strokeWidth={2.5} />
                    </button>
                  </div>
               </div>
            </div>
          ))}
          {enrolled.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
               <Book className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active enrollments</p>
               <button 
                onClick={() => setActiveTab('explore')}
                className="mt-4 text-indigo-600 font-bold uppercase text-[10px] tracking-widest hover:text-indigo-700 transition-colors"
               >
                 Explore Modules Now →
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
