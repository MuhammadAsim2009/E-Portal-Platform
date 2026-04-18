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
  DollarSign
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
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
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-slate-800">E-Portal</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`
              }

              onClick={() => setIsSidebarOpen(false)}
            >
              {link.icon}
              <span className="ml-3">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700">
              <User size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header for mobile */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 lg:hidden">
          <span className="text-xl font-bold text-slate-800">E-Portal</span>
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
