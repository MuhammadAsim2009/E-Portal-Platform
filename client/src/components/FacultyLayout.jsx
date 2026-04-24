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
  const { user, logout } = useAuthStore();
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
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 text-white flex flex-col z-50 transform transition-all duration-300 ease-in-out ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-8 py-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 rotate-3">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-lg tracking-tight text-white leading-tight">EduSphere</p>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Faculty Hub</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Navigation</p>
          </div>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={19} className="relative z-10" />
              <span className="flex-1 relative z-10">{label}</span>
              <ChevronRight size={14} className={`relative z-10 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1`} />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800/50">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-lg">
                {user?.name?.[0]?.toUpperCase() || 'F'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Faculty'}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-2xl transition-all"
          >
            <LogOut size={18} className="text-red-500" /> 
            <span>Log Out</span>
          </button>
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
