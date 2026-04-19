import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as studentCtrl from '../controllers/student.controller.js';
import { uploadAssignment } from '../middleware/upload.middleware.js';

const router = express.Router();

// Apply authentication to all student routes
router.use(authenticateJWT);

// Restrict access to students only
router.use(authorizeRoles(['student']));

router.get('/dashboard', studentCtrl.getDashboard);
router.get('/announcements', studentCtrl.getAnnouncements);
router.get('/courses/available', studentCtrl.getAvailableCourses);
router.post('/enroll', studentCtrl.enrollModule);
router.post('/drop', studentCtrl.dropModule);
router.post('/swap', studentCtrl.swapModule);
router.post('/payments', studentCtrl.submitPayment);
router.post('/assignments/submit', uploadAssignment.single('file'), studentCtrl.submitAssignment);

export default router;
