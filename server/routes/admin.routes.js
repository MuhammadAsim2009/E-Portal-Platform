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
  updateAnnouncement,
  deleteAnnouncement,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  createAdminUser,
  bulkCreateUsers,
  getSections,
  getFacultyList,
  updateSectionSchedule,
  createSection,
  deleteSection,
  getSectionStudents,
  enrollStudent,
  getFinancialAnalytics,
  updateCourse,
  deleteCourse,
  getEligibleStudents,
  removeStudent,
  getAuditLogs,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  getPayments,
  updatePaymentStatus,
  updateSettings,
  testEmail,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  bulkGenerateFees,
  getSettings
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes are protected by JWT + admin role
router.use(authenticateJWT, authorizeRoles(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.post('/users/bulk', bulkCreateUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);

// Timetable & Sections
router.get('/sections', getSections);
router.post('/sections', createSection);
router.get('/faculty', getFacultyList);
router.patch('/sections/:id', updateSectionSchedule);
router.delete('/sections/:id', deleteSection);
router.get('/sections/:id/students', getSectionStudents);
router.get('/sections/:id/eligible-students', getEligibleStudents);
router.post('/sections/:id/enroll', enrollStudent);
router.delete('/sections/:id/enroll/:studentId', removeStudent);

// Financials
router.get('/analytics', getFinancialAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.get('/payments', getPayments);
router.patch('/payments/:id/status', updatePaymentStatus);

// Course Management
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Site Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.post('/settings/test-email', testEmail);

// Fee Structures
router.get('/fee-structures', getFeeStructures);
router.post('/fee-structures', createFeeStructure);
router.patch('/fee-structures/:id', updateFeeStructure);
router.delete('/fee-structures/:id', deleteFeeStructure);
router.post('/fees/bulk-generate', bulkGenerateFees);

export default router;
