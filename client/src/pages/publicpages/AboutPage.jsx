import { Users, Award, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const VALUES = [
  {
    icon: '🎯',
    title: 'Simple by design',
    desc: 'We believe institutional software should be easy for everyone — not just IT departments. Every feature is built with clarity first.',
  },
  {
    icon: '🔒',
    title: 'Security you can trust',
    desc: 'Your student data is protected by end-to-end encryption, role-based access control, and a complete audit trail.',
  },
  {
    icon: '⚡',
    title: 'Built to scale',
    desc: 'Whether you have 200 students or 200,000 — E-Portal handles the load without slowing down.',
  },
  {
    icon: '🤝',
    title: 'Customers first',
    desc: 'We provide hands-on support during onboarding and are always reachable when you need help.',
  },
];

const TEAM_HIGHLIGHTS = [
  'Founded by educators and engineers',
  'Serving institutions across 84 countries',
  'Over 12 million active students',
  '99.99% uptime since launch',
];

const STATS = [
  { value: '2,400+', label: 'Institutions' },
  { value: '84', label: 'Countries' },
  { value: '12M+', label: 'Students' },
  { value: '99.99%', label: 'Uptime' },
];

import usePageTitle from '../../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AboutPage() {
  usePageTitle('About Us');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const dynamicStats = settings ? [
    { value: `${settings.studentsCount}+`, label: 'Active Students' },
    { value: `${settings.facultyCount}+`, label: 'Expert Faculty' },
    { value: `${settings.coursesCount}+`, label: 'Active Courses' },
    { value: settings.avgJobPlacement || '95%', label: 'Job Placement' },
  ] : [
    { value: '...', label: 'Active Students' },
    { value: '...', label: 'Expert Faculty' },
    { value: '...', label: 'Active Courses' },
    { value: '...', label: 'Job Placement' },
  ];

  return (
    <div className="bg-white dark:bg-[#0a0a0a]">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/8 dark:bg-blue-500/8 blur-[120px] -z-10" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">About E-Portal</p>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6">
              We build tools that help<br className="hidden md:block" />
              <span className="text-blue-600 dark:text-blue-400"> schools work better.</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              E-Portal started with one goal: make running an educational institution less complicated. We're a team of builders and educators who believe that administration should never get in the way of learning.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Our Mission</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Simplify the work<br />behind education.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Institutional management is full of repetitive tasks, disconnected tools, and unnecessary complexity. We built E-Portal to change that — giving administrators, faculty, and students a single, cohesive platform that just works.
              </p>
              <ul className="space-y-3">
                {TEAM_HIGHLIGHTS.map(h => (
                  <li key={h} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={17} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Panel */}
            <div className="relative">
              <div className="bg-slate-900 dark:bg-[#111] rounded-3xl p-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                    <Users size={32} className="text-blue-400 opacity-60" />
                  </div>
                  <div className="h-28 bg-emerald-600/10 rounded-2xl flex items-center justify-center">
                    <Award size={32} className="text-emerald-400 opacity-60" />
                  </div>
                </div>
                <div className="h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Globe size={28} className="text-slate-500" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl shadow-blue-600/30">
                99.99% Uptime ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 bg-slate-50 dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Our Values</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">How we build.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white dark:bg-[#111] rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-3xl mb-5">{v.icon}</div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
            Want to see E-Portal in action?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Create your account today and explore everything E-Portal has to offer — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="h-12 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
