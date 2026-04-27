import { ArrowRight, Shield, Zap, Layers, ChevronRight, Globe, Star, Command } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#FAF8FF] dark:bg-[#020617] transition-colors duration-700">
      {/* ── Editorial Hero ── */}
      <section className="relative pt-32 pb-40 lg:pt-56 lg:pb-72 overflow-hidden">
        {/* Atmospheric Depth Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-br from-blue-600/10 to-indigo-500/5 blur-[150px] -z-10 animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Asymmetrical Content */}
            <div className="lg:col-span-7 space-y-12">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Institutional OS V2.0</span>
              </div>
              
              <h1 className="text-6xl md:text-[5.5rem] font-bold text-[#191B24] dark:text-white tracking-tighter leading-[0.9] animate-slide-up">
                The Operating System for <br />
                <span className="text-[#0050CB] dark:text-blue-500 relative">
                  Modern Academia.
                  <svg className="absolute -bottom-4 left-0 w-full h-4 text-blue-500/20 dark:text-blue-400/10" viewBox="0 0 400 20" fill="none">
                    <path d="M0 10C50 0 150 20 250 10C350 0 400 10 400 10" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-[#424656] dark:text-slate-400 font-medium leading-relaxed max-w-xl animate-fade-in delay-300">
                A curated digital environment that unifies fragmented institutional systems into a high-end, editorial-grade experience. 
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 animate-fade-in delay-500">
                <Link to="/register" className="h-16 px-10 bg-gradient-to-r from-[#0050CB] to-[#0066FF] text-white rounded-xl text-sm font-bold shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  Deploy E-Portal <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="h-16 px-10 bg-white dark:bg-slate-900 text-[#191B24] dark:text-white rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3">
                  Read Case Studies
                </Link>
              </div>
            </div>

            {/* Floating Glass Preview */}
            <div className="lg:col-span-5 relative lg:mt-12 animate-slide-up delay-700">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-emerald-500/10 blur-3xl -z-10" />
              <div className="relative aspect-[4/5] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-white/5 shadow-[0_32px_64px_-12px_rgba(25,27,36,0.12)] overflow-hidden">
                <div className="p-8 space-y-10">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      <Command size={24} />
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#0050CB] dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Live Portal</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl" />
                      <div className="h-32 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl" />
                    </div>
                    <div className="h-48 bg-white dark:bg-slate-800 rounded-3xl shadow-sm" />
                  </div>
                </div>
                
                {/* Asymmetrical Overlay */}
                <div className="absolute bottom-10 -right-10 w-64 h-40 bg-emerald-500/10 dark:bg-emerald-400/5 backdrop-blur-3xl rounded-3xl border border-white/20 transform rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted Tier ── */}
      <section className="py-24 bg-white dark:bg-[#020617] border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-50 grayscale dark:invert">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 md:w-48 leading-relaxed">Trusted by Global Hubs</span>
            <div className="flex-1 flex flex-wrap justify-around items-center gap-12">
               <span className="text-2xl font-bold tracking-tighter">STANFORD</span>
               <span className="text-2xl font-bold tracking-tighter">OXFORD</span>
               <span className="text-2xl font-bold tracking-tighter">TSINGHUA</span>
               <span className="text-2xl font-bold tracking-tighter">SORBONNE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Tonal Grid (Features) ── */}
      <section className="py-40 bg-[#FAF8FF] dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-32 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191B24] dark:text-white tracking-tight leading-tight">
              Designed for the Digital Curator.
            </h2>
            <p className="text-xl text-[#424656] dark:text-slate-400 font-medium">
              We break the rigid, boxed-in nature of traditional software. E-Portal is structured through tonal shifts and light, creating a liquid workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CuratedCard 
              icon={<Shield className="w-8 h-8" />}
              title="Authority"
              desc="Bank-grade security meets academic transparency. Every transaction is audited and verified."
              accent="blue"
            />
            <CuratedCard 
              icon={<Zap className="w-8 h-8" />}
              title="Velocity"
              desc="Real-time synchronization across continents. No lag, no latency, just academic progress."
              accent="emerald"
            />
            <CuratedCard 
              icon={<Layers className="w-8 h-8" />}
              title="Symmetry"
              desc="Integrated data models that unify student finance, academics, and administration."
              accent="indigo"
            />
          </div>
        </div>
      </section>

      {/* ── High-Contrast CTA ── */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-[#0050CB] dark:bg-blue-600 rounded-[4rem] p-16 md:p-32 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
            
            <div className="relative z-10 space-y-12 text-center lg:text-left lg:flex items-center justify-between">
              <div className="max-w-2xl space-y-8">
                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.95]">
                  Join the academic <br />vanguard.
                </h2>
                <p className="text-blue-100/60 text-xl font-medium">
                  Experience the institutional OS that powers the world's most innovative academic environments.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 lg:flex-shrink-0">
                <Link to="/register" className="h-20 px-12 bg-white text-[#0050CB] rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                  Get Started <ChevronRight size={20} />
                </Link>
                <Link to="/contact" className="h-20 px-12 bg-transparent text-white border border-white/20 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CuratedCard({ icon, title, desc, accent }) {
  const accents = {
    blue: "bg-blue-600/10 text-blue-600",
    emerald: "bg-emerald-600/10 text-emerald-600",
    indigo: "bg-indigo-600/10 text-indigo-600"
  };

  return (
    <div className="group p-12 bg-white dark:bg-[#020617] rounded-[3rem] border border-slate-50 dark:border-slate-800/50 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(25,27,36,0.08)] transition-all duration-500">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform ${accents[accent]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#191B24] dark:text-white tracking-tight mb-4">{title}</h3>
      <p className="text-[#424656] dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
