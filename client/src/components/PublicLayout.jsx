import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, Sun, Moon, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

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
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsMenuOpen(false), [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans antialiased">

      {/* Navbar */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <GraduationCap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight">E-Portal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              Sign in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-1.5">
              Get started <ChevronRight size={14} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-500">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-700 dark:text-white">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 px-6 py-6 space-y-1">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-3">
              <Link to="/login" className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 text-center border border-slate-200 dark:border-white/10 rounded-lg">Sign in</Link>
              <Link to="/register" className="block px-4 py-3 text-sm font-medium bg-blue-600 text-white text-center rounded-lg">Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-[15px]">E-Portal</span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                A complete student information system for modern educational institutions.
              </p>
            </div>

            <FooterCol title="Product" links={[
              { name: 'Services', path: '/services' },
              { name: 'About', path: '/about' },
              { name: 'Contact', path: '/contact' },
            ]} />
            <FooterCol title="Account" links={[
              { name: 'Sign In', path: '/login' },
              { name: 'Register', path: '/register' },
            ]} />
            <FooterCol title="Legal" links={[
              { name: 'Privacy Policy', path: '#' },
              { name: 'Terms of Use', path: '#' },
            ]} />
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} E-Portal. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.name}>
            <Link to={link.path} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
