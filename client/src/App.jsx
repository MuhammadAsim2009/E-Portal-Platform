import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Layout components
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import FacultyLayout from './components/FacultyLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseEnrollment from './pages/student/CourseEnrollment';
import StudentAnnouncements from './pages/student/StudentAnnouncements';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentManagement from './pages/admin/StudentManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import CourseManagement from './pages/admin/CourseManagement';
import Announcements from './pages/admin/Announcements';
import TimetableManagement from './pages/admin/TimetableManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import Analytics from './pages/admin/Analytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import SiteSettings from './pages/admin/SiteSettings';

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MyCourses from './pages/faculty/MyCourses';
import GradeBook from './pages/faculty/GradeBook';
import AttendancePage from './pages/faculty/AttendancePage';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Student Module ── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="explore" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentDashboard />} />

          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="assignments" element={<StudentDashboard />} />
          <Route path="academic" element={<StudentDashboard />} />
          <Route path="finance" element={<StudentDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Admin Module ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="faculty" element={<FacultyManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="timetable" element={<TimetableManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Faculty Module ── */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="gradebook" element={<GradeBook />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Default redirects ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
