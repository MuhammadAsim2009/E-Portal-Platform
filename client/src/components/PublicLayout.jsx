import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, Sun, Moon, Command, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => setIsMenuOpen(false), [location]);

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#020617] text-[#191B24] dark:text-slate-100 font-sans selection:bg-blue-500/30 transition-colors duration-500">
      {/* ── Glassmorphic Utility Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[110] h-1.5 bg-gradient-to-r from-[#0050CB] via-blue-400 to-emerald-400 opacity-80" />

      {/* ── Curated Header ── */}
      <header className="fixed top-0 z-[100] w-full bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-12 h-12 bg-[#0050CB] rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-all duration-300">
                  <Command size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter dark:text-white leading-none">E-Portal</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0050CB] dark:text-blue-400 mt-1">Institutional</span>
              </div>
            </Link>

            {/* Editorial Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {[
                { name: 'Solutions', path: '/services' },
                { name: 'Philosophy', path: '/about' },
                { name: 'Connect', path: '/contact' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="px-6 py-2 text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#0050CB] dark:hover:text-white transition-all uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-6" />
              
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all active:scale-90"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link to="/login" className="ml-6 px-8 h-12 bg-[#191B24] dark:bg-white text-white dark:text-[#191B24] rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none flex items-center">
                Portal Access
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-6 lg:hidden">
              <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[#191B24] dark:text-white"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-100 dark:border-slate-800 p-10 space-y-8 animate-in fade-in slide-in-from-top-2">
            <Link to="/services" className="block text-3xl font-bold tracking-tighter">Solutions</Link>
            <Link to="/about" className="block text-3xl font-bold tracking-tighter">Philosophy</Link>
            <Link to="/contact" className="block text-3xl font-bold tracking-tighter">Connect</Link>
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-6">
              <Link to="/login" className="text-xl font-bold">Log in</Link>
              <Link to="/register" className="h-20 bg-[#0050CB] text-white rounded-[2rem] flex items-center justify-center font-black uppercase tracking-widest text-sm shadow-2xl">Create Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Editorial Viewport ── */}
      <main className="relative z-0">
        <Outlet />
      </main>

      {/* ── The Institution Footer ── */}
      <footer className="bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800/40 pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0050CB] rounded-2xl flex items-center justify-center text-white">
                  <Command size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tighter dark:text-white">E-Portal Institutional</span>
              </div>
              <p className="text-lg text-[#424656] dark:text-slate-400 font-medium leading-relaxed max-w-md">
                A unified digital engine designed to elevate academic excellence through high-performance cloud infrastructure and curated user experiences.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <FooterColumn title="Foundation" links={[
                { name: 'Solutions', path: '/services' },
                { name: 'Philosophy', path: '/about' },
                { name: 'Infrastructure', path: '#' }
              ]} />
              <FooterColumn title="Support" links={[
                { name: 'Connect', path: '/contact' },
                { name: 'Documentation', path: '#' },
                { name: 'Cloud Status', path: '#' }
              ]} />
              <FooterColumn title="Legal" links={[
                { name: 'Privacy Architecture', path: '#' },
                { name: 'Compliance', path: '#' },
                { name: 'Terms of Use', path: '#' }
              ]} />
            </div>
          </div>
          
          <div className="mt-32 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">© 2026 E-Portal Institutional Ecosystem</p>
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-[#FAF8FF] dark:bg-white/5 border border-slate-100 dark:border-white/10">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cloud Operations Optimized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-8">
      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#191B24] dark:text-white">{title}</h4>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link.name}>
            <Link to={link.path} className="text-sm font-bold text-[#424656] dark:text-slate-400 hover:text-[#0050CB] dark:hover:text-white transition-colors">{link.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
