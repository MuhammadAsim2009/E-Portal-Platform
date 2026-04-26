import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Megaphone, Calendar, BarChart3,
  LogOut, Menu, X, ChevronRight, Shield, Bell, Search, Settings,
  GraduationCap, Briefcase, User as UserIcon, CreditCard, DollarSign, CheckCircle2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const navGroups = [
  {
    title: 'Overview',
    links: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    title: 'Management',
    links: [
      { to: '/admin/users', icon: Users, label: 'All Users' },
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/admin/faculty', icon: Briefcase, label: 'Faculty' },
      { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
      { to: '/admin/course-approvals', icon: CheckCircle2, label: 'Course Approvals' },
      { to: '/admin/timetable', icon: Calendar, label: 'Timetable' },

      { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
      { to: '/admin/fees-config', icon: DollarSign, label: 'Fee Matrix' },
    ]
  },
  {
    title: 'Communication',
    links: [
      { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ]
  },
  {
    title: 'System',
    links: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, siteSettings } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Also refresh count when navigating

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/admin/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 lg:hidden transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col z-30 transform transition-all duration-300 ease-out shadow-2xl ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-8 py-8 border-b border-slate-800/60">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Shield size={20} className="text-white drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white leading-none">{siteSettings?.siteName || 'E-Portal'}</span>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1.5 opacity-80">Operational Intelligence</span>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto scrollbar-hide">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <p className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.links.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-400 border border-indigo-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-all group-hover:translate-x-1" />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white/5 shadow-lg">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate tracking-tight">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-[13px] font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-2xl transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 gap-6 flex-shrink-0 z-10 sticky top-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all bg-white shadow-sm"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search administration..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border-transparent border focus:border-indigo-500 rounded-2xl text-sm transition-all focus:bg-white focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/notifications')}
              className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 transition-all group"
            >
              <Bell size={20} className="transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-rose-500 border-2 border-white rounded-full text-white text-[10px] font-black flex items-center justify-center animate-in zoom-in duration-300 shadow-sm shadow-rose-200">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${showProfileDropdown ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <UserIcon size={20} />
              </button>
              
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileDropdown(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[13px] font-black text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => { navigate('/admin/settings'); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3"
                    >
                      <Settings size={16} /> Dashboard Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-[12px] font-black text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#f8fafc] scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
