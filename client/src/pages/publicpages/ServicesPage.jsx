import { Check, BarChart3, Users, Zap, Globe, Cpu, Database, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    icon: Users,
    color: 'blue',
    title: 'Student Management',
    desc: 'A complete student record system. Manage profiles, enrollment, grades, attendance, and communications in one place.',
    features: ['Enrollment & registration', 'Academic progress tracking', 'Student–faculty messaging', 'Document management'],
  },
  {
    icon: BarChart3,
    color: 'emerald',
    title: 'Fee Management',
    desc: 'Handle all financial operations without spreadsheets. Generate invoices, process payments, and track outstanding dues instantly.',
    features: ['Automated fee generation', 'Payment recording & receipts', 'Waiver & discount management', 'Financial reporting'],
  },
  {
    icon: Cpu,
    color: 'violet',
    title: 'Faculty Tools',
    desc: 'Give teachers everything they need to run their courses — from scheduling to grade submission — without the admin overhead.',
    features: ['Course & section management', 'Attendance marking', 'Assignment & grade entry', 'Resource distribution'],
  },
  {
    icon: Database,
    color: 'indigo',
    title: 'Admin Dashboard',
    desc: 'A powerful central dashboard for administrators. Monitor everything happening across your institution in real time.',
    features: ['Cross-department analytics', 'User & role management', 'Audit logs', 'Data export & reporting'],
  },
];

const INFRA = [
  { label: 'Uptime SLA', value: '99.99%' },
  { label: 'Data Encrypted', value: 'AES-256' },
  { label: 'Response Time', value: '<200ms' },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-500/20' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/20' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/20' },
};

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-[#0a0a0a]">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/8 dark:bg-blue-500/8 blur-[120px] -z-10" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">What we offer</p>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-5">
            Every tool your institution needs,<br className="hidden md:block" /> in one platform.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            E-Portal covers the full spectrum of institutional management — from student enrollment to financial reporting — without the complexity of stitching together multiple systems.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5">
            Start for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-24 bg-slate-50 dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SERVICES.map(s => {
              const c = colorMap[s.color];
              const Icon = s.icon;
              return (
                <div key={s.title} className="bg-white dark:bg-[#111] rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all duration-200">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${c.bg} border ${c.border} mb-6`}>
                    <Icon size={22} className={c.text} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2.5">
                    {s.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className={`w-5 h-5 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                          <Check size={11} className={c.text} strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Infrastructure ── */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-slate-900 dark:bg-[#111] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* Left */}
              <div className="p-12 lg:p-16 space-y-8">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Infrastructure</p>
                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                  Secure, reliable,<br /> and always on.
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Your institution's data is encrypted, backed up automatically, and hosted across redundant servers. We handle the infrastructure so you can focus on education.
                </p>
                <ul className="space-y-4">
                  {['End-to-end encryption', 'Automatic daily backups', 'Role-based access control', 'Full audit trail'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Metrics */}
              <div className="bg-slate-800/50 dark:bg-black/20 p-12 lg:p-16 flex flex-col justify-center gap-8">
                {INFRA.map(m => (
                  <div key={m.label} className="flex items-center justify-between border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <p className="text-slate-400 text-sm">{m.label}</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="flex items-center gap-2.5 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    All systems operational
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-slate-50 dark:bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
            Start managing your campus today.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            No setup fees, no long onboarding. Get your institution up and running on E-Portal in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Get started <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="h-12 px-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
