import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getFacultyDashboard,
  getMyCourses,
  getSectionStudents,
  updateGrade,
  getAttendance,
  submitAttendance,
  getSectionAssignments,
  createAssignment,
  submitCourseRequest,
  getMyRequests,
} from '../controllers/faculty.controller.js';


const router = Router();

// All faculty routes protected by JWT + faculty role
router.use(authenticateJWT, authorizeRoles(['faculty']));

router.get('/dashboard', getFacultyDashboard);
router.get('/courses', getMyCourses);

// Grade Book
router.get('/sections/:sectionId/students', getSectionStudents);
router.patch('/enrollments/:enrollmentId/grade', updateGrade);

// Attendance
router.get('/sections/:sectionId/attendance', getAttendance);
router.post('/sections/:sectionId/attendance', submitAttendance);

// Assignments
router.get('/sections/:sectionId/assignments', getSectionAssignments);
router.post('/sections/:sectionId/assignments', createAssignment);

// Course Management Requests
router.post('/course-requests', submitCourseRequest);
router.get('/course-requests', getMyRequests);


export default router;
