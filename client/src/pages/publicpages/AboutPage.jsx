import { GraduationCap, Award, Users, BookOpen, Globe, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-[#FAF8FF] dark:bg-[#020617]">
      {/* ── Philosophy Hero ── */}
      <section className="pt-40 pb-32 lg:pt-56 lg:pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-bl from-indigo-500/10 to-blue-500/5 blur-[150px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0050CB] dark:text-blue-400">Our Philosophy</span>
            </div>
            
            <h1 className="text-6xl md:text-[5rem] font-bold text-[#191B24] dark:text-white tracking-tighter leading-[0.95] animate-slide-up">
              Architecting the <br />
              <span className="text-[#0050CB] dark:text-blue-500">Future of Knowledge.</span>
            </h1>
            
            <p className="text-2xl text-[#424656] dark:text-slate-400 font-medium leading-relaxed max-w-2xl animate-fade-in delay-300">
              E-Portal is not a software company. We are digital curators, building the structural integrity that modern institutions require to thrive in a hyper-connected world.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values (Tonal Layering) ── */}
      <section className="py-40 bg-white dark:bg-[#020617] border-y border-slate-50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-16">
              <PhilosophySection 
                icon={<Lightbulb className="w-8 h-8" />}
                title="Radical Integration"
                desc="We believe software should be invisible. E-Portal unifies administrative silos into a single, cohesive academic engine."
              />
              <PhilosophySection 
                icon={<Users className="w-8 h-8" />}
                title="The Human Protocol"
                desc="Technology must serve the scholar, not the other way around. Our UX is designed for focus, flow, and human interaction."
              />
              <PhilosophySection 
                icon={<Award className="w-8 h-8" />}
                title="Sovereign Excellence"
                desc="We provide the tools for institutions to maintain their legacy while embracing radical digital transformation."
              />
            </div>
            
            <div className="relative">
              <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] -z-10" />
              <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-[4rem] flex items-center justify-center p-20 border border-slate-100 dark:border-slate-800 shadow-sm">
                <GraduationCap className="w-full h-full text-[#0050CB] dark:text-blue-500 opacity-20" strokeWidth={1} />
              </div>
              <div className="absolute bottom-10 -left-10 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-4xl font-bold tracking-tighter">99.9%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Global Vision ── */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">A global network of <span className="text-[#0050CB]">Smarter Campus.</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <VisionMetric label="Institutions" value="2,400+" />
             <VisionMetric label="Countries" value="84" />
             <VisionMetric label="Scholars" value="12M+" />
             <VisionMetric label="Uptime" value="99.99%" />
          </div>
        </div>
      </section>
    </div>
  );
}

function PhilosophySection({ icon, title, desc }) {
  return (
    <div className="space-y-6 group">
      <div className="w-16 h-16 bg-[#0050CB]/5 dark:bg-blue-500/10 text-[#0050CB] dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-[#424656] dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function VisionMetric({ label, value }) {
  return (
    <div className="p-10 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm">
      <p className="text-5xl font-bold tracking-tighter text-[#191B24] dark:text-white mb-2">{value}</p>
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0050CB] dark:text-blue-400">{label}</p>
    </div>
  );
}
