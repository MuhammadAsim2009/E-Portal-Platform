import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BookOpen, 
  Calendar, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const dummyAttendance = [
  { name: 'Week 1', rate: 100 },
  { name: 'Week 2', rate: 95 },
  { name: 'Week 3', rate: 90 },
  { name: 'Week 4', rate: 92 },
  { name: 'Week 5', rate: 85 }
];

const StudentDashboard = () => {
  const [data, setData] = useState({ enrolled: [], assignments: [], unpaidFees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-b-2 rounded-full border-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex p-4 text-red-700 bg-red-100 rounded-lg">
        <AlertCircle className="w-5 h-5 mr-3" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back!</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-4">
            <BookOpen size={20} className="mr-2" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Enrolled Courses</h2>
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.enrolled.length}</p>
        </div>
        
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-4">
            <Calendar size={20} className="mr-2" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Upcoming Tasks</h2>
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.assignments.length}</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-4">
            <CreditCard size={20} className="mr-2" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Pending Fees</h2>
          </div>
          <p className="text-3xl font-bold text-red-600">${data.unpaidFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Chart */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyAttendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Timetable / Enrolled Courses */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Enrolled Modules</h2>
          {data.enrolled.length === 0 ? (
            <p className="text-slate-500">You are not enrolled in any modules.</p>
          ) : (
            <ul className="space-y-4">
              {data.enrolled.map((course, idx) => (
                <li key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-800">{course.course_code} - {course.title}</h3>
                    <p className="text-sm text-slate-500">Section {course.section_name} • {course.schedule_time}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                    Active
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
