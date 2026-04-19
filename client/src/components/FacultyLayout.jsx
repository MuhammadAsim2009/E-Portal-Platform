import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  CalendarCheck, LogOut, Menu, X, ChevronRight, GraduationCap, FileText
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navLinks = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/faculty/gradebook', icon: ClipboardList, label: 'Grade Book' },
  { to: '/faculty/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/faculty/assignments', icon: FileText, label: 'Assignments' },
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
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
          <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">E-Portal</p>
            <p className="text-xs text-slate-400 font-medium">Faculty Portal</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Faculty'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-all">
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'F'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
