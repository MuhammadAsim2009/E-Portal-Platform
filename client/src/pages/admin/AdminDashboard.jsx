import usePageTitle from '../../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users, BookOpen, GraduationCap, TrendingUp,
  Megaphone, UserCheck, ArrowUpRight, ArrowDownRight, Activity,
  Clock, Calendar, Filter, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
const enrollmentTrend = [
  { month: 'Sep', active: 42, new: 12 }, { month: 'Oct', active: 68, new: 26 },
  { month: 'Nov', active: 75, new: 15 }, { month: 'Dec', active: 55, new: 8 },
  { month: 'Jan', active: 88, new: 33 }, { month: 'Feb', active: 95, new: 22 },
  { month: 'Mar', active: 102, new: 18 }, { month: 'Apr', active: 87, new: 10 },
];
const deptData = [
  { dept: 'CS', students: 48, color: '#6366f1' }, 
  { dept: 'Math', students: 30, color: '#8b5cf6' },
  { dept: 'English', students: 22, color: '#ec4899' }, 
  { dept: 'Physics', students: 18, color: '#f43f5e' },
  { dept: 'Business', students: 35, color: '#f59e0b' },
];
const StatCard = ({ icon: Icon, label, value, trend, isPositive, color }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600').replace('600', '600')} ${color.replace(' text-', ' bg-')} shadow-sm transition-transform duration-500`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
        {value?.toLocaleString() ?? '—'}
      </h3>
      <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{label}</p>
    </div>
  </div>
);
const AdminDashboard = () => {
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const activities = [
    { id: 1, user: 'Sarah Connor', action: 'New Student Registration', time: '12m ago', status: 'Verified', color: 'bg-emerald-500' },
    { id: 2, user: 'Dr. Alan Smith', action: 'Course Content Update', time: '45m ago', status: 'Published', color: 'bg-indigo-500' },
    { id: 3, user: 'System Bot', action: 'Database Backup Completed', time: '2h ago', status: 'Success', color: 'bg-slate-500' },
    { id: 4, user: 'Dr. Ellie Sattler', action: 'Faculty Assignment', time: '5h ago', status: 'Pending', color: 'bg-amber-500' },
    { id: 5, user: 'John Doe', action: 'Profile Information Updated', time: '8h ago', status: 'Verified', color: 'bg-emerald-500' },
  ];
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, annRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/announcements'),
        ]);
        setStats(statsRes.data);
        setAnnouncements((annRes.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setStats({
          totalUsers: 0, totalStudents: 0, totalFaculty: 0, activeCourses: 0, activeEnrollments: 0,
          enrollmentTrend: [], departmentDistribution: [], activities: []
        });
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield size={16} className="text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2 text-sm">
            <Activity size={16} className="text-indigo-500" />
            Insights and performance metrics for <span className="text-slate-900 font-semibold">E-Portal</span>.
          </p>
        </div>
      </div>
      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Platform Users" value={stats?.totalUsers} trend="12.5%" isPositive={true} color="bg-indigo-600 text-indigo-600" />
        <StatCard icon={GraduationCap} label="Enrolled Students" value={stats?.totalStudents} trend="8.2%" isPositive={true} color="bg-purple-600 text-purple-600" />
        <StatCard icon={UserCheck} label="Active Faculty" value={stats?.totalFaculty} trend="2.1%" isPositive={false} color="bg-rose-500 text-rose-600" />
        <StatCard icon={BookOpen} label="Published Courses" value={stats?.activeCourses} trend="14.8%" isPositive={true} color="bg-emerald-500 text-emerald-600" />
      </div>
      {/* Main Insights Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 overflow-hidden relative group shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Learning Trajectory</h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Monthly enrollment & engagement velocity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full mt-4 flex items-center justify-center">
            {stats?.enrollmentTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.enrollmentTrend}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#f1f5f9', strokeWidth: 1 }} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={{ stroke: '#f1f5f9', strokeWidth: 1 }} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                    padding: '16px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fill="url(#activeGrad)" 
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  stroke="#c084fc" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="text-slate-300 font-bold text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-3">
                <Activity size={32} className="opacity-20" />
                There is no data to show
              </div>
            )}
          </div>
        </div>
        {/* Small Data Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-400 mb-6">Department Distribution</h2>
              <div className="space-y-5">
                {stats?.departmentDistribution?.length > 0 ? (
                   stats.departmentDistribution.slice(0, 4).map((d) => (
                    <div key={d.dept} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <span>{d.dept}</span>
                        <span className="text-slate-900">{d.students}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className="h-full rounded-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_8px_rgba(79,102,241,0.2)]"
                          style={{ width: `${d.students}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    No distribution data
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Announcements Feed Dashboard Layer */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Live platform intelligence feed</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">
            <Filter size={14} /> Full Audit Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">User Identity</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Performed</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Log</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.activities?.length > 0 ? (
                stats.activities.map((act) => (
                  <tr key={act.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-bold uppercase">
                          {act.user.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{act.user}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[13px] font-medium text-slate-600 capitalize">{act.action.replace(/_/g, ' ')}</td>
                    <td className="py-4 text-[12px] font-bold text-slate-400">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-4 pr-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${act.color || 'bg-slate-400'}`} />
                        {act.severity || 'Info'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-300 font-bold text-xs uppercase tracking-[0.2em]">
                    There is no data to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
