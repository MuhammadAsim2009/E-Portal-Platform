import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Search, 
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  CheckCircle2,
  Activity,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics = () => {
  const [data, setData] = useState({ 
    stats: { totalRevenue: 124500, collectionRate: 85, pendingAmount: 18400 }, 
    incomePerCourse: [
      { course_code: 'CS101', title: 'Intro to Computer Science', enrolled_students: 120, total_income: 60000, growth: 12 },
      { course_code: 'ENG202', title: 'Advanced English', enrolled_students: 85, total_income: 42500, growth: -5 },
      { course_code: 'MATH301', title: 'Calculus III', enrolled_students: 65, total_income: 32500, growth: 8 },
      { course_code: 'PHY101', title: 'General Physics', enrolled_students: 95, total_income: 47500, growth: 15 },
    ] 
  });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');

  const [revenueTimeframe, setRevenueTimeframe] = useState('Week');

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data) setData(res.data);
    } catch (err) {
      console.error("Using fallback data for analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportPDF = () => {
    setIsExporting(true);
    
    // Simulate processing
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Premium Header
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('INSTITUTIONAL PERFORMANCE REPORT', 14, 25);
        
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);
        
        // Key Metrics Section
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text('I. FINANCIAL KPI SUMMARY', 14, 55);
        
        autoTable(doc, {
          startY: 60,
          head: [['METRIC TYPE', 'QUANTITATIVE VALUE', 'STATUS']],
          body: [
            ['Total Platform Revenue', `$${data.stats.totalRevenue?.toLocaleString()}`, 'OPTIMAL'],
            ['Fee Collection Velocity', `${data.stats.collectionRate}%`, 'ON TRACK'],
            ['Total Outstanding Receivables', `$${data.stats.pendingAmount?.toLocaleString()}`, 'ATTENTION'],
          ],
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 5 }
        });
        
        // Course Performance Section
        doc.setFontSize(14);
        doc.text('II. ACADEMIC UNIT YIELD ANALYSIS', 14, doc.lastAutoTable.finalY + 20);
        
        const tableData = data.incomePerCourse.map(item => [
          item.course_code,
          item.title,
          item.enrolled_students,
          `$${parseFloat(item.total_income).toLocaleString()}`
        ]);
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 25,
          head: [['COURSE ID', 'CURRICULUM TITLE', 'ENROLLMENT', 'GROSS YIELD']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          styles: { fontSize: 9 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount} - Confidential E-Portal Intelligence`, 14, 285);
        }
        
        doc.save(`EPortal_Analytics_${new Date().getTime()}.pdf`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  const handleExportCSV = () => {
    const headers = ['Course Code', 'Title', 'Enrolled Students', 'Total Income'];
    const rows = data.incomePerCourse.map(item => [
      item.course_code,
      item.title,
      item.enrolled_students,
      parseFloat(item.total_income)
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EPortal_Analytics_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revenueData = revenueTimeframe === 'Week' ? [
    { name: 'Mon', revenue: 4200 },
    { name: 'Tue', revenue: 3800 },
    { name: 'Wed', revenue: 5400 },
    { name: 'Thu', revenue: 4900 },
    { name: 'Fri', revenue: 6200 },
    { name: 'Sat', revenue: 3100 },
    { name: 'Sun', revenue: 2800 },
  ] : [
    { name: 'Week 1', revenue: 28400 },
    { name: 'Week 2', revenue: 32100 },
    { name: 'Week 3', revenue: 29800 },
    { name: 'Week 4', revenue: 34200 },
  ];

  const distributionData = [
    { name: 'Computer Science', value: 1080, color: '#6366f1' },
    { name: 'Engineering', value: 600, color: '#c084fc' },
    { name: 'Mathematics', value: 360, color: '#2dd4bf' },
    { name: 'Business', value: 360, color: '#f59e0b' },
  ];

  const filteredData = data.incomePerCourse.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.course_code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Aggregating Institutional Data...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Intelligence Panel</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm">
            <Activity size={16} className="text-indigo-500" />
            Performance velocity and financial diagnostics.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="group flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[13px] font-bold transition-all shadow-sm hover:bg-slate-50 active:scale-95"
          >
            <FileText size={18} className="text-indigo-500" />
            CSV
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`group flex items-center gap-3 px-6 py-3.5 ${isExporting ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-2xl text-[13px] font-bold transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95`}
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            )}
            {isExporting ? 'Generating...' : 'PDF Report'}
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Platform Revenue', value: `$${data.stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12.5%', isPos: true },
          { label: 'Collection Rate', value: `${data.stats.collectionRate}%`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Optimal', isPos: true },
          { label: 'Receivables', value: `$${data.stats.pendingAmount?.toLocaleString()}`, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'High Priority', isPos: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all duration-500">
            <div className={`absolute right-4 top-4 w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center ${kpi.color} group-hover:scale-110 transition-transform duration-500`}>
              <kpi.icon size={22} />
            </div>
            <div className="relative z-10">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">{kpi.label}</div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</div>
              <div className={`mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${kpi.isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {kpi.isPos ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Velocity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Weekly financial trajectory</p>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl flex gap-1">
              <button 
                onClick={() => setRevenueTimeframe('Week')}
                className={`px-3 py-1.5 text-[10px] font-bold transition-all rounded-lg ${revenueTimeframe === 'Week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setRevenueTimeframe('Month')}
                className={`px-3 py-1.5 text-[10px] font-bold transition-all rounded-lg ${revenueTimeframe === 'Month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#barGrad)" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Unit Distribution</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Enrollment density by faculty</p>
            </div>
          </div>
          <div className="h-[340px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`${value.toLocaleString()} Students`, 'Enrollment']}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[57%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-black text-slate-900">2.4k</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Layer */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <Layers size={22} />
             </div>
             <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Ledger</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5 underline decoration-indigo-500/30 underline-offset-4">Transaction Audits</p>
             </div>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Filter by course or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/5 text-[14px] font-bold text-slate-700 w-full transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Unit</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Density</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Yield</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {item.course_code.slice(0,2)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">{item.course_code} • General Curriculum</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center text-[10px] font-black">
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {item.enrolled_students} LEADERS
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="text-sm font-black text-slate-900">${parseFloat(item.total_income).toLocaleString()}</div>
                    <div className="text-[9px] font-black text-emerald-500 flex items-center justify-end gap-1 mt-1.5 uppercase tracking-widest">
                      Confirmed <CheckCircle2 size={10} />
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-100">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

