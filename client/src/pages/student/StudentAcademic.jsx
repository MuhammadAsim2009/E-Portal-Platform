import React from 'react';
import { 
  Award, 
  Download, 
  TrendingUp, 
  Smartphone, 
  ClipboardList 
} from 'lucide-react';

const StudentAcademic = ({ 
  studentInfo, 
  enrolled, 
  attendance, 
  gradesBreakdown, 
  gradePredictions, 
  setGradePredictions, 
  handleDownloadAcademicReport 
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      {/* Academic Header */}
      <div className="bg-slate-900 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl shadow-slate-200">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Award size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">Academic Performance</h2>
            <p className="text-slate-400 text-xs font-medium mt-1">Track your scholastic evolution and performance metrics.</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadAcademicReport}
          className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
        >
          <Download size={16} /> Official Transcript
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-8">Performance Snapshot</h2>
            <div className="space-y-6">
               <div className="p-6 bg-slate-50/50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cumulative GPA</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{studentInfo.gpa || '0.00'}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-200" />
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enrollments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{enrolled.length}</p>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 font-medium italic">Calculated based on verified assessment records.</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
             <h2 className="text-base font-bold text-slate-900 tracking-tight mb-8">Academic Record</h2>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                         <Award size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Course</p>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{studentInfo.program || 'General Science'}</p>
                      </div>
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                         <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Contact Ref</p>
                        <p className="text-xs font-bold text-slate-800 tracking-tight">{studentInfo.contact_number || '---'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

        {/* GPA Predictor */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100 bg-indigo-50/10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">GPA Forecasting</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Project your cumulative success</p>
               </div>
             </div>
             <div className="px-6 py-2 bg-slate-900 rounded-xl text-white flex flex-col items-center shadow-lg shadow-slate-200">
               <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Projected</span>
               <span className="text-xl font-bold">
                 {(() => {
                   const currentGpa = parseFloat(studentInfo.gpa || 0);
                   const historicalCredits = 60; 
                   let totalPoints = (currentGpa * historicalCredits);
                   let totalCredits = historicalCredits;
                   enrolled.forEach(c => {
                     const gp = gradePredictions[c.section_id] || 4.0;
                     totalPoints += (gp * (c.credit_hours || 3));
                     totalCredits += (c.credit_hours || 3);
                   });
                   return (totalPoints / totalCredits).toFixed(2);
                 })()}
               </span>
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {enrolled.map(course => (
               <div key={course.section_id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{course.course_code}</p>
                 <h4 className="text-sm font-bold text-slate-800 mb-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                 <div className="flex items-center justify-between gap-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Grade:</span>
                   <select 
                     className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 outline-none focus:border-indigo-300 transition-all"
                     onChange={(e) => setGradePredictions({...gradePredictions, [course.section_id]: parseFloat(e.target.value)})}
                     defaultValue="4.0"
                   >
                     <option value="4.0">A (4.0)</option>
                     <option value="3.7">A- (3.7)</option>
                     <option value="3.3">B+ (3.3)</option>
                     <option value="3.0">B (3.0)</option>
                     <option value="2.7">B- (2.7)</option>
                     <option value="2.3">C+ (2.3)</option>
                     <option value="2.0">C (2.0)</option>
                     <option value="1.0">D (1.0)</option>
                     <option value="0.0">F (0.0)</option>
                   </select>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Detailed Grade Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Assessment Breakdown</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detailed performance analytics</p>
            </div>
          </div>

          <div className="space-y-8">
            {(() => {
              const grouped = gradesBreakdown.reduce((acc, curr) => {
                if (!acc[curr.course_code]) {
                  acc[curr.course_code] = {
                    title: curr.course_title,
                    final_grade: curr.final_grade,
                    components: []
                  };
                }
                acc[curr.course_code].components.push(curr);
                return acc;
              }, {});

              const courses = Object.keys(grouped);
              if (courses.length === 0) return <p className="text-xs text-slate-400 font-medium italic text-center py-10">No assessment data released yet.</p>;

              return courses.map(code => (
                <div key={code} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-white p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{code}</p>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">{grouped[code].title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Standing</p>
                      <p className="text-lg font-bold text-indigo-600">{grouped[code].final_grade || '--'}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {grouped[code].components.map(comp => {
                        const percentage = comp.marks_obtained !== null 
                          ? ((comp.marks_obtained / comp.max_marks) * 100).toFixed(0) 
                          : null;
                        
                        return (
                          <div key={comp.component_id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div 
                              className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" 
                              style={{ width: `${percentage || 0}%` }}
                            />
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{comp.component_name}</span>
                              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{comp.weightage}%</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <span className="text-lg font-bold text-slate-900">{comp.marks_obtained ?? '--'}</span>
                                <span className="text-[10px] font-bold text-slate-200 ml-1">/ {comp.max_marks}</span>
                              </div>
                              {percentage !== null && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {percentage}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
    </div>
  );
};

export default StudentAcademic;
