import { Check, Shield, BarChart3, Users, Zap, Globe, Cpu, Database } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="flex flex-col bg-[#FAF8FF] dark:bg-[#020617]">
      {/* ── Solutions Hero ── */}
      <section className="pt-40 pb-32 lg:pt-56 lg:pb-48 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-blue-600/10 to-transparent blur-[150px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl space-y-12">
            <h1 className="text-6xl md:text-8xl font-bold text-[#191B24] dark:text-white tracking-tighter leading-[0.9] animate-slide-up">
              Institutional <br />
              <span className="text-[#0050CB] dark:text-blue-500">Solutions.</span>
            </h1>
            <p className="text-2xl text-[#424656] dark:text-slate-400 font-medium leading-relaxed animate-fade-in delay-300">
              High-performance infrastructure for the modern campus. From student management to financial forecasting, we provide the curated engine for institutional growth.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Solution Matrix ── */}
      <section className="py-32 bg-white dark:bg-[#020617] border-y border-slate-50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SolutionCard 
              icon={<Users className="w-8 h-8" />}
              title="Student Lifecycle"
              desc="Comprehensive portal for registration, progress tracking, and academic engagement."
              features={['Automated Enrollment', 'Progress Visualizations', 'Direct Faculty Messaging']}
              color="blue"
            />
            <SolutionCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Financial Nexus"
              desc="Bank-grade fee management with predictive revenue modeling and automated invoicing."
              features={['Dynamic Fee Generation', 'Payment Gateway Integration', 'Revenue Analytics']}
              color="emerald"
            />
            <SolutionCard 
              icon={<Cpu className="w-8 h-8" />}
              title="Faculty Engine"
              desc="Empowering educators with real-time course management and automated gradebook tools."
              features={['Smart Course Scheduling', 'Bulk Grade Processing', 'Resource Distribution']}
              color="indigo"
            />
            <SolutionCard 
              icon={<Database className="w-8 h-8" />}
              title="Institutional Intel"
              desc="Unified data lake providing real-time insights across every department and campus."
              features={['Cross-Department Analytics', 'Data Archival Systems', 'Regulatory Reporting']}
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* ── Infrastructure Section ── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#191B24] dark:bg-white/5 rounded-[4rem] p-16 md:p-32 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
             
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-12">
                   <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-tight">Built on the <br /><span className="text-[#0066FF]">Sovereign Cloud.</span></h2>
                   <p className="text-slate-400 text-xl font-medium leading-relaxed">
                     Our infrastructure is designed for extreme durability and zero-latency performance. We don't just host data; we protect the institution's digital sovereignty.
                   </p>
                   <ul className="space-y-6">
                      {['End-to-End Encryption', 'Multi-Region Failover', '99.99% Guaranteed SLA'].map(item => (
                        <li key={item} className="flex items-center gap-4 text-white font-bold tracking-tight">
                           <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check size={14} />
                           </div>
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="h-64 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center">
                      <Zap className="w-16 h-16 text-blue-500" strokeWidth={1} />
                   </div>
                   <div className="h-64 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center mt-12">
                      <Globe className="w-16 h-16 text-blue-400" strokeWidth={1} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SolutionCard({ icon, title, desc, features, color }) {
  const colors = {
    blue: "bg-blue-600 text-white shadow-blue-500/20",
    emerald: "bg-emerald-600 text-white shadow-emerald-500/20",
    indigo: "bg-indigo-600 text-white shadow-indigo-500/20"
  };

  return (
    <div className="p-12 bg-[#FAF8FF] dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 hover:shadow-[0_32px_64px_-12px_rgba(25,27,36,0.1)] transition-all group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-3xl font-bold tracking-tighter mb-6">{title}</h3>
      <p className="text-lg text-[#424656] dark:text-slate-400 font-medium mb-10 leading-relaxed">{desc}</p>
      <ul className="space-y-4">
        {features.map(f => (
          <li key={f} className="flex items-center gap-3 text-sm font-bold text-[#191B24] dark:text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            <Check size={14} className="text-blue-600" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
