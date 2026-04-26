import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, ClipboardList, CalendarCheck, FileText, 
  MessageSquare, Megaphone, Bell, GraduationCap, X, ChevronRight, 
  LogOut, Menu, Search, Settings 
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navLinks = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/faculty/gradebook', icon: ClipboardList, label: 'Grade Book' },
  { to: '/faculty/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/faculty/assignments', icon: FileText, label: 'Assignments' },
  { to: '/faculty/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/faculty/evaluations', icon: MessageSquare, label: 'Feedback & Reports' },
  { to: '/faculty/notifications', icon: Bell, label: 'Notifications' },
];

const FacultyLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, siteSettings } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 font-sans overflow-hidden">
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 text-white flex flex-col z-50 transform transition-all duration-500 ease-in-out ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-24 px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
               <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">{siteSettings?.siteName || 'E-Portal'}</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Faculty Hub</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-5 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Navigation</p>
              <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-slate-800 to-transparent" />
            </div>
            <div className="space-y-1.5">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                      )}
                      <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="ml-3.5 tracking-tight flex-1">{label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-sm">
           <div className="flex items-center p-4 bg-slate-800/40 rounded-3xl border border-slate-700/50 group transition-all duration-500 hover:bg-slate-800/60 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {user?.name?.[0]?.toUpperCase() || 'F'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm" />
              </div>
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-[13px] font-black text-white truncate leading-tight tracking-tight">{user?.full_name || user?.name || 'Faculty'}</p>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> Active Hub
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                title="Sign Out"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center px-8 gap-6 flex-shrink-0 z-40">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-all bg-white dark:bg-slate-900">
            <Menu size={20} />
          </button>

          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Date</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            
            <button className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
            </button>
            
            <button className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
              <Settings size={20} />
            </button>
            
            <div className="w-px h-8 bg-slate-200 dark:border-slate-800 mx-2"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg rotate-3">
                {user?.name?.[0]?.toUpperCase() || 'F'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/30 dark:bg-slate-950 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
