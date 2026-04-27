import { Mail, Phone, MapPin, Send, MessageSquare, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col bg-[#FAF8FF] dark:bg-[#020617]">
      {/* ── Contact Hero ── */}
      <section className="pt-40 pb-32 lg:pt-56 lg:pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-[150px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl space-y-12">
            <h1 className="text-6xl md:text-8xl font-bold text-[#191B24] dark:text-white tracking-tighter leading-[0.9] animate-slide-up">
              Let’s <span className="text-[#0050CB] dark:text-blue-500">Connect.</span>
            </h1>
            <p className="text-2xl text-[#424656] dark:text-slate-400 font-medium leading-relaxed animate-fade-in delay-300">
              Whether you are architecting a new institution or scaling an existing campus, our specialists are ready to help you deploy the E-Portal engine.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Grid ── */}
      <section className="py-24 bg-white dark:bg-[#020617] border-y border-slate-50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            {/* Form */}
            <div className="lg:col-span-7">
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ContactInput label="Full Name" placeholder="Dr. Julian Vane" />
                  <ContactInput label="Institutional Email" placeholder="julian@university.edu" />
                </div>
                <ContactInput label="Institution Name" placeholder="Oxford Academy of Arts" />
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Your Vision</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-[#FAF8FF] dark:bg-white/5 border-0 rounded-[2rem] p-8 text-lg focus:ring-2 focus:ring-[#0050CB] transition-all outline-none resize-none"
                    placeholder="How can we help you transform your academic ecosystem?"
                  />
                </div>
                <button className="h-20 px-12 bg-[#0050CB] text-white rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all w-full md:w-auto">
                  Initiate Connection <Send size={18} />
                </button>
              </form>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-5 space-y-16">
              <ContactInfoBlock 
                icon={<Mail className="w-6 h-6" />}
                title="Institutional Support"
                value="concierge@e-portal.io"
              />
              <ContactInfoBlock 
                icon={<Phone className="w-6 h-6" />}
                title="Direct Line"
                value="+1 (888) ACADEMIA"
              />
              <ContactInfoBlock 
                icon={<MapPin className="w-6 h-6" />}
                title="Headquarters"
                value="Digital Plaza, Silicon Valley, CA"
              />
              
              <div className="p-12 bg-[#FAF8FF] dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10">
                 <h4 className="text-xl font-bold tracking-tight mb-4">Concierge Hours</h4>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Mon - Fri: 08:00 - 22:00 EST</p>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Sat - Sun: 10:00 - 18:00 EST</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Global Support Tier ── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-12">
          <Globe className="w-20 h-20 text-[#0050CB] mx-auto opacity-20" strokeWidth={1} />
          <h2 className="text-4xl font-bold tracking-tighter">Support across every <span className="text-[#0050CB]">time zone.</span></h2>
          <p className="text-xl text-[#424656] dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Our globally distributed engineering team ensures your portal remains operational 24/7, regardless of geographic location.
          </p>
        </div>
      </section>
    </div>
  );
}

function ContactInput({ label, placeholder }) {
  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</label>
      <input 
        type="text"
        className="w-full h-20 bg-[#FAF8FF] dark:bg-white/5 border-0 rounded-2xl px-8 text-lg focus:ring-2 focus:ring-[#0050CB] transition-all outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function ContactInfoBlock({ icon, title, value }) {
  return (
    <div className="flex gap-8 items-start group">
      <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{title}</h4>
        <p className="text-2xl font-bold tracking-tight text-[#191B24] dark:text-white">{value}</p>
      </div>
    </div>
  );
}
