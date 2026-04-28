import { ArrowRight, Shield, Zap, Layers, Users, BarChart3, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '12M+', label: 'Students managed' },
  { value: '2,400+', label: 'Institutions' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '84', label: 'Countries' },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Student Management',
    desc: 'Complete student lifecycle management — from enrollment to graduation. View profiles, track progress, and manage records from one place.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Fee & Finance',
    desc: 'Generate invoices, record payments, and track outstanding dues. Full financial visibility without the spreadsheets.',
    color: 'emerald',
  },
  {
    icon: BookOpen,
    title: 'Course Management',
    desc: 'Schedule classes, assign faculty, manage enrollments, and distribute course materials — all in a single system.',
    color: 'violet',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    desc: 'Role-based access control ensures the right people see the right data. Every action is logged and auditable.',
    color: 'orange',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    desc: 'Attendance, grades, and payments sync instantly. No refresh needed — everyone works with live data.',
    color: 'rose',
  },
  {
    icon: Layers,
    title: 'Unified Dashboard',
    desc: 'One dashboard for administrators, faculty, and students. Clear analytics and a clean interface for every role.',
    color: 'indigo',
  },
];

const WORKFLOW = [
  { step: '01', title: 'Set up your institution', desc: 'Add your departments, programs, and academic calendar in minutes.' },
  { step: '02', title: 'Enroll students & faculty', desc: 'Import existing records or onboard users directly through the portal.' },
  { step: '03', title: 'Run your campus', desc: 'Manage classes, attendance, fees, and communications from one place.' },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-500/20' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-500/20' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-500/20' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-500/20' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-500/10',   text: 'text-rose-600 dark:text-rose-400',   ring: 'ring-rose-200 dark:ring-rose-500/20' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-500/20' },
};

import usePageTitle from '../../hooks/usePageTitle';

export default function HomePage() {
  usePageTitle('Home');
  return (
    <div className="bg-white dark:bg-[#0a0a0a]">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-28 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 dark:bg-blue-500/10 blur-[100px] rounded-full -z-10" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 tracking-wide">Student Information System</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6">
            The smarter way to<br className="hidden md:block" />
            <span className="text-blue-600 dark:text-blue-400"> run your campus.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            E-Portal is a complete institutional management platform — student records, courses, attendance, fees, and more. Built for clarity, built to scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center gap-2">
              Get started for free <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="h-12 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
              View all features <ChevronRight size={15} />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-white/10 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
            {STATS.map(s => (
              <div key={s.label} className="bg-white dark:bg-[#111] px-8 py-5 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 bg-slate-50 dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Everything your institution needs.
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              All the tools to manage students, staff, and finances — without the complexity of multiple disconnected systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => {
              const c = colorMap[f.color];
              const Icon = f.icon;
              return (
                <div key={f.title} className="group bg-white dark:bg-[#111] rounded-2xl p-7 border border-slate-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-5`}>
                    <Icon size={20} className={c.text} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Up and running in minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-slate-200 dark:bg-white/10" />
            {WORKFLOW.map(w => (
              <div key={w.step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/30">
                  {w.step}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{w.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20 bg-slate-50 dark:bg-[#0d0d0d] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-10 uppercase tracking-widest font-medium">Trusted by institutions worldwide</p>
          <div className="flex flex-wrap justify-center gap-10 opacity-40 dark:opacity-20 grayscale">
            {['STANFORD', 'MIT', 'OXFORD', 'CAMBRIDGE', 'TSINGHUA'].map(n => (
              <span key={n} className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 rounded-3xl px-12 py-20 overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
                Ready to get started?
              </h2>
              <p className="text-blue-100/80 text-lg mb-10 max-w-lg mx-auto">
                Join thousands of institutions that use E-Portal to manage their campus more efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="h-12 px-8 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-xl flex items-center justify-center gap-2">
                  Start for free <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="h-12 px-8 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center">
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
