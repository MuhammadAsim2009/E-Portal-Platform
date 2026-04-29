import React from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  FileText, 
  CreditCard, 
  MoreVertical, 
  Upload, 
  ChevronRight, 
  Megaphone, 
  Pin,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const DashboardCard = ({ title, value, icon, color = "indigo", subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-500 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
        color === 'amber' ? 'bg-amber-50 text-amber-600' : 
        'bg-rose-50 text-rose-600'
      }`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      {subtitle && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</span>}
    </div>
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const AttendanceGauge = ({ percentage, course }) => {
  const getColor = (p) => {
    if (p >= 85) return 'text-emerald-500';
    if (p >= 75) return 'text-amber-500';
    return 'text-rose-500';
  }
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs ${getColor(percentage)} border-current bg-white shadow-sm`}>
          {percentage}%
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{course}</h4>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{percentage < 75 ? 'At Risk' : 'Healthy'}</p>
        </div>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full ${percentage < 75 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
    </div>
  );
};

const StudentOverview = ({ 
  studentInfo, 
  enrolled, 
  assignments, 
  attendance, 
  unpaidFees, 
  trendData, 
  announcements, 
  switchTab, 
  setShowSubmissionModal,
  navigate 
}) => {
  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Current GPA" 
          value={studentInfo.gpa || 'N/A'} 
          icon={<TrendingUp />} 
          color="indigo" 
          subtitle={`Section ${studentInfo.semester}`} 
        />
        <DashboardCard 
          title="Course Load" 
          value={enrolled.length} 
          icon={<BookOpen />} 
          color="emerald" 
          subtitle={`${enrolled.filter(e => e.status === 'enrolled').length} Active | ${enrolled.filter(e => e.status === 'pending').length} Pending`} 
        />
        <DashboardCard 
          title="Pending" 
          value={assignments.filter(a => a.status === 'Pending').length} 
          icon={<FileText />} 
          color="amber" 
          subtitle="Next 7D" 
        />
        <DashboardCard 
          title="Balance" 
          value={`PKR ${parseFloat(unpaidFees).toLocaleString()}`} 
          icon={<CreditCard />} 
          color="rose" 
          subtitle="Due Now" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics: GPA Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Academic Performance</h2>
              <p className="text-xs text-slate-500 mt-1">Performance breakdown of graded assignment submissions.</p>
            </div>
            <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
              <TrendingUp size={14} /> Merit Standing
            </span>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} minTickGap={30} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="marks" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMarks)"
                    dot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }} 
                    name="Marks %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-3 animate-in fade-in duration-700">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                  <TrendingUp size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 italic">No data to show</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance View */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Attendance</h2>
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={18} /></button>
          </div>
          <div className="space-y-4">
            {attendance.length > 0 ? attendance.map((item, idx) => (
              <AttendanceGauge key={idx} percentage={item.percentage} course={item.course} />
            )) : (
              <div className="text-center py-12">
                 <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-3">
                    <Clock size={24} />
                 </div>
                 <p className="text-xs text-slate-400 font-medium italic">No attendance data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Quick Upload Section */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                     <Upload size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Tasks</h2>
               </div>
               <button 
                  onClick={() => switchTab('assignments')}
                  className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
               >
                  View All
               </button>
            </div>
            <div className="space-y-4">
               {assignments.filter(a => a.status === 'Pending').slice(0, 3).length > 0 ? assignments.filter(a => a.status === 'Pending').slice(0, 3).map((a) => (
                  <div 
                  key={a.assignment_id}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all flex items-center justify-between group"
                  >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-600 shadow-sm border border-slate-100 transition-colors">
                        <FileText size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{a.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.course_code}</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setShowSubmissionModal(a)}
                     className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-md shadow-slate-200"
                  >
                     Upload
                  </button>
                  </div>
               )) : (
                  <p className="text-xs text-slate-400 text-center py-10 font-medium italic">All caught up!</p>
               )}
            </div>
         </div>

         {/* Recent Announcements Widget */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                     <Megaphone size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional News</h2>
               </div>
               <button 
                  onClick={() => switchTab('announcements')}
                  className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
               >
                  Archives
               </button>
            </div>
            <div className="space-y-4">
               {announcements.slice(0, 3).length > 0 ? announcements.slice(0, 3).map((a) => (
                  <div 
                  key={a.announcement_id} 
                  onClick={() => navigate('/student/announcements')}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group cursor-pointer"
                  >
                  <div className="flex items-center justify-between mb-3">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                        a.category === 'Exam' ? 'bg-rose-50 text-rose-600' : 
                        a.category === 'Alert' ? 'bg-amber-50 text-amber-600' : 
                        'bg-indigo-50 text-indigo-600'
                     }`}>
                        {a.category}
                     </span>
                     {a.is_pinned && <Pin size={12} className="text-amber-500 fill-current" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                     {a.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">
                     {a.body}
                  </p>
                  </div>
               )) : (
                  <p className="text-xs text-slate-400 text-center py-10 font-medium italic">No new announcements.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentOverview;
