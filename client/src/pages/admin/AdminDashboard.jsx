import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users, BookOpen, GraduationCap, TrendingUp,
  AlertCircle, Megaphone, UserCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const enrollmentTrend = [
  { month: 'Sep', count: 42 }, { month: 'Oct', count: 68 },
  { month: 'Nov', count: 75 }, { month: 'Dec', count: 55 },
  { month: 'Jan', count: 88 }, { month: 'Feb', count: 95 },
  { month: 'Mar', count: 102 }, { month: 'Apr', count: 87 },
];

const deptData = [
  { dept: 'CS', students: 48 }, { dept: 'Math', students: 30 },
  { dept: 'English', students: 22 }, { dept: 'Physics', students: 18 },
  { dept: 'Business', students: 35 },
];

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        {subtext}
      </span>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-1">{value?.toLocaleString() ?? '—'}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, annRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/announcements'),
        ]);
        setStats(statsRes.data);
        setAnnouncements(annRes.data.slice(0, 3));
      } catch {
        setStats({ totalUsers: 142, totalStudents: 120, totalFaculty: 18, activeCourses: 34, activeEnrollments: 287 });
        setAnnouncements([
          { announcement_id: '1', title: 'Mid-term Schedule Released', category: 'Academic', is_pinned: true },
          { announcement_id: '2', title: 'Library Extended Hours', category: 'General', is_pinned: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Platform overview and key metrics at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="bg-slate-800" subtext="All roles" />
        <StatCard icon={GraduationCap} label="Students" value={stats?.totalStudents} color="bg-primary-600" subtext="Active" />
        <StatCard icon={UserCheck} label="Faculty" value={stats?.totalFaculty} color="bg-violet-600" subtext="Active" />
        <StatCard icon={BookOpen} label="Active Courses" value={stats?.activeCourses} color="bg-emerald-600" subtext="This semester" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-800">Enrollment Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly active enrollments this year</p>
            </div>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#enrollGrad)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-800">By Department</h2>
            <p className="text-xs text-slate-400 mt-0.5">Student distribution</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={48} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Bar dataKey="students" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Announcements Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Megaphone size={16} className="text-primary-500" />
            Recent Announcements
          </h2>
        </div>
        <div className="space-y-3">
          {announcements.length === 0 && (
            <p className="text-sm text-slate-400">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div key={a.announcement_id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                {a.is_pinned && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                <p className="text-sm font-medium text-slate-700">{a.title}</p>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{a.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
