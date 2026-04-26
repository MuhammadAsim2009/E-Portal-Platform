import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as studentCtrl from '../controllers/student.controller.js';
import { uploadAssignmentS3, uploadReceiptS3 } from '../middleware/upload.middleware.js';

const router = express.Router();

// Apply authentication to all student routes
router.use(authenticateJWT);

// Restrict access to students only
router.use(authorizeRoles(['student']));

router.get('/dashboard', studentCtrl.getDashboard);
router.get('/settings', studentCtrl.getSiteSettings);
router.put('/settings', studentCtrl.updateSettings);
router.get('/announcements', studentCtrl.getAnnouncements);
router.get('/courses/available', studentCtrl.getAvailableCourses);
router.post('/enroll', uploadReceiptS3.single('receipt'), studentCtrl.enrollModule);
router.post('/drop', studentCtrl.dropModule);
router.post('/swap', studentCtrl.swapModule);
router.post('/payments', uploadReceiptS3.single('receipt'), studentCtrl.submitPayment);
router.post('/assignments/submit', uploadAssignmentS3.single('file'), studentCtrl.submitAssignment);
router.get('/grades', studentCtrl.getGrades);
router.get('/submissions/:submissionId/signed-url', studentCtrl.getSubmissionSignedUrl);



export default router;
