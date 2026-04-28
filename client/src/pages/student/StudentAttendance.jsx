import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  CalendarDays, CheckCircle2, XCircle, Clock, AlertTriangle,
  TrendingUp, ChevronDown, ChevronUp, BookOpen, Search, Filter
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const pct = (present, total) =>
  total > 0 ? Math.round((present / total) * 100) : 100;

const statusColor = (p) => {
  if (p >= 85) return { ring: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Good Standing' };
  if (p >= 75) return { ring: 'text-amber-600',  bg: 'bg-amber-50',  bar: 'bg-amber-500',  badge: 'bg-amber-100  text-amber-700',  label: 'At Risk'       };
  return        { ring: 'text-rose-600',   bg: 'bg-rose-50',   bar: 'bg-rose-500',   badge: 'bg-rose-100   text-rose-700',   label: 'Critical'      };
};

const ATTENDANCE_THRESHOLD = 75;

// ── Ring chart ────────────────────────────────────────────────────────────────
const RingChart = ({ percentage }) => {
  const c = statusColor(percentage);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="currentColor" strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className={`transition-all duration-700 ${c.ring}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-black leading-none ${c.ring}`}>{percentage}%</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Attended</span>
      </div>
    </div>
  );
};

// ── Course card ────────────────────────────────────────────────────────────────
const CourseCard = ({ course, records }) => {
  const [open, setOpen] = useState(false);
  const attendance = pct(parseInt(course.present), parseInt(course.total_classes));
  const c = statusColor(attendance);
  const courseRecords = records
    .filter(r => r.section_id === course.section_id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Card header */}
      <div className="p-5 flex items-center gap-4">
        <RingChart percentage={attendance} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">
                {course.course_code}
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-tight mt-0.5">
                {course.course_title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {course.instructor_name || 'Instructor TBA'} · {course.section_name}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${c.badge}`}>
              {c.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                style={{ width: `${attendance}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2.5 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={12} /> {course.present} Present
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <XCircle size={12} /> {course.absent} Absent
            </span>
            {parseInt(course.late) > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <Clock size={12} /> {course.late} Late
              </span>
            )}
            <span className="text-slate-400 ml-auto">{course.total_classes} Total</span>
          </div>
        </div>
      </div>

      {/* Low attendance warning */}
      {attendance < ATTENDANCE_THRESHOLD && (
        <div className="mx-5 mb-3 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3">
          <AlertTriangle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-semibold text-rose-700">
            Your attendance is below the {ATTENDANCE_THRESHOLD}% threshold. You need{' '}
            <span className="font-black">
              {Math.ceil(
                (ATTENDANCE_THRESHOLD / 100 * parseInt(course.total_classes) - parseInt(course.present)) /
                (1 - ATTENDANCE_THRESHOLD / 100)
              )}
            </span>{' '}
            more consecutive classes to reach the minimum.
          </p>
        </div>
      )}

      {/* Toggle records */}
      {courseRecords.length > 0 && (
        <>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <span>{open ? 'Hide' : 'View'} daily records ({courseRecords.length})</span>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {open && (
            <div className="px-5 pb-5 pt-3 border-t border-slate-50">
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {courseRecords.map((r) => {
                  const statusMeta = {
                    present: { icon: <CheckCircle2 size={13} />, cls: 'text-emerald-600 bg-emerald-50', label: 'Present' },
                    absent:  { icon: <XCircle size={13} />,      cls: 'text-rose-500   bg-rose-50',    label: 'Absent'  },
                    late:    { icon: <Clock size={13} />,         cls: 'text-amber-500  bg-amber-50',   label: 'Late'    },
                  }[r.status] || { icon: null, cls: 'text-slate-400 bg-slate-50', label: r.status };

                  return (
                    <div key={r.attendance_id}
                      className="flex items-center justify-between text-xs rounded-xl px-3 py-2 bg-slate-50">
                      <span className="font-semibold text-slate-600">
                        {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                        {statusMeta.icon} {statusMeta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentAttendance() {
  const [data, setData]       = useState({ summary: [], records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | good | at-risk | critical

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/attendance');
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredCourses = useMemo(() => {
    return data.summary
      .filter(c => {
        const name = `${c.course_code} ${c.course_title}`.toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
        const p = pct(parseInt(c.present), parseInt(c.total_classes));
        if (filter === 'good')     return p >= 85;
        if (filter === 'at-risk')  return p >= 75 && p < 85;
        if (filter === 'critical') return p < 75;
        return true;
      });
  }, [data.summary, search, filter]);

  // Overall stats
  const totalPresent  = data.summary.reduce((s, c) => s + parseInt(c.present || 0), 0);
  const totalClasses  = data.summary.reduce((s, c) => s + parseInt(c.total_classes || 0), 0);
  const overallPct    = pct(totalPresent, totalClasses);
  const criticalCount = data.summary.filter(c => pct(parseInt(c.present), parseInt(c.total_classes)) < ATTENDANCE_THRESHOLD).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400">Loading attendance…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <XCircle size={48} className="text-rose-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-500">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {/* ── Internal header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Summary</h2>
            <p className="text-xs text-slate-500 mt-1">Monitor your presence across all enrolled courses.</p>
          </div>
          
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest ${statusColor(overallPct).badge} shadow-lg shadow-slate-100`}>
            <TrendingUp size={16} />
            Overall Presence: {overallPct}%
          </div>
        </div>

        {/* ── Filters & Search ── */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search courses by code or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
            {[
              { key: 'all',      label: 'All' },
              { key: 'good',     label: '≥ 85%' },
              { key: 'at-risk',  label: '75–84%' },
              { key: 'critical', label: '< 75%' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Course cards ── */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
            <CalendarDays size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {data.summary.length === 0
                ? 'No attendance records found'
                : 'No matches found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.section_id}
                course={course}
                records={data.records}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


