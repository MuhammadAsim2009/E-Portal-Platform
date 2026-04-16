import express from 'express';
import { authorizeRoles } from '../middleware/auth.middleware.js';
import * as studentCtrl from '../controllers/student.controller.js';

const router = express.Router();

// All student routes require student role
router.use(authorizeRoles(['student']));

router.get('/dashboard', studentCtrl.getDashboard);
router.get('/courses/available', studentCtrl.getAvailableCourses);
router.post('/enroll', studentCtrl.enrollModule);
router.post('/payments', studentCtrl.submitPayment);

export default router;
