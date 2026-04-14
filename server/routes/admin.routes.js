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
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes are protected by JWT + admin role
router.use(authenticateJWT, authorizeRoles(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Course Management
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

export default router;
