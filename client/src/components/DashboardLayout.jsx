import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  User,
  Megaphone,
  BookOpen,
  FileText,
  Award,
  DollarSign,
  Settings
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, siteSettings } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Announcements', path: '/student/announcements', icon: <Megaphone size={20} /> },
    { name: 'Explore', path: '/student/explore', icon: <BookOpen size={20} /> },
    { name: 'My Courses', path: '/student/courses', icon: <Award size={20} /> },
    { name: 'Assignments', path: '/student/assignments', icon: <FileText size={20} /> },

    { name: 'Academic', path: '/student/academic', icon: <Award size={20} /> },
    { name: 'Finance', path: '/student/finance', icon: <DollarSign size={20} /> },
    { name: 'Feedback', path: '/student/feedback', icon: <Megaphone size={20} /> },
    { name: 'Settings', path: '/student/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white border-r border-slate-100 transition-all duration-500 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between h-24 px-8 border-b border-slate-50/50">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
               <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">{siteSettings?.siteName || 'E-Portal'}</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Management System</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden transition-colors rounded-xl hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-5 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Section: Main Menu */}
          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Main Menu</p>
              <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-slate-100 to-transparent" />
            </div>
            <div className="space-y-1.5">
              {navLinks.slice(0, 5).map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                    }`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                      )}
                      <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                        {React.cloneElement(link.icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
                      </div>
                      <span className="ml-3.5 tracking-tight">{link.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section: Academic Records */}
          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Records & Finance</p>
              <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-slate-100 to-transparent" />
            </div>
            <div className="space-y-1.5">
              {navLinks.slice(5).map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                    }`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                      )}
                      <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                        {React.cloneElement(link.icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
                      </div>
                      <span className="ml-3.5 tracking-tight">{link.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/20 backdrop-blur-sm">
           <div className="flex items-center p-4 bg-white/80 rounded-3xl border border-white shadow-xl shadow-slate-200/40 group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {user?.name?.[0] || 'S'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="ml-3 overflow-hidden flex-1">
                <div className="text-[13px] font-black text-slate-900 truncate leading-tight tracking-tight">{user?.full_name || user?.name || 'Student'}</div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> Online Now
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                title="Sign Out"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
           </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header for mobile */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 lg:hidden">
          <span className="text-xl font-bold text-slate-800">{siteSettings?.siteName || 'E-Portal'}</span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
