import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllCourses,
  createCourse,
  getAnnouncements,
  createAnnouncement,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUser,
  createAdminUser,
  getSections,
  getFacultyList,
  updateSectionSchedule,
  createSection,
  getFinancialAnalytics,
  updateCourse,
  deleteCourse,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes are protected by JWT + admin role
router.use(authenticateJWT, authorizeRoles(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);

// Timetable & Sections
router.get('/sections', getSections);
router.post('/sections', createSection);
router.get('/faculty', getFacultyList);
router.patch('/sections/:id', updateSectionSchedule);

// Financials
router.get('/analytics', getFinancialAnalytics);

// Course Management
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

export default router;
