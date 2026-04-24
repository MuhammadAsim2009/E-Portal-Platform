import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  getFacultyDashboard,
  getMyCourses,
  getSectionStudents,
  updateGrade,
  getAssessmentComponents,
  createAssessmentComponent,
  updateAssessmentComponent,
  deleteAssessmentComponent,
  getSectionGradebook,
  updateStudentMarks,
  getGradeScale,
  getAttendance,


  submitAttendance,
  getSectionAssignments,
  createAssignment,
  submitCourseRequest,
  getMyRequests,
  getAssignmentSubmissions,
  getAssignmentById,
  gradeSubmission,
  deleteAssignment,
  getEvaluations,
  getEvaluationResponses,
  createEvaluation,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getNotifications,
  markNotificationAsRead
} from '../controllers/faculty.controller.js';


const router = Router();

// All faculty routes protected by JWT + faculty role
router.use(authenticateJWT, authorizeRoles(['faculty']));

router.get('/dashboard', getFacultyDashboard);
router.get('/courses', getMyCourses);

// Grade Book
router.get('/sections/:sectionId/students', getSectionStudents);
router.patch('/enrollments/:enrollmentId/grade', updateGrade);
router.get('/sections/:sectionId/gradebook', getSectionGradebook);
router.get('/sections/:sectionId/assessments', getAssessmentComponents);
router.post('/sections/:sectionId/assessments', createAssessmentComponent);
router.patch('/assessments/:componentId', updateAssessmentComponent);
router.delete('/assessments/:componentId', deleteAssessmentComponent);
router.patch('/enrollments/:enrollmentId/components/:componentId/marks', updateStudentMarks);
router.get('/grade-scale', getGradeScale);



// Attendance
router.get('/sections/:sectionId/attendance', getAttendance);
router.post('/sections/:sectionId/attendance', submitAttendance);

// Assignments
router.get('/sections/:sectionId/assignments', getSectionAssignments);
router.post('/sections/:sectionId/assignments', createAssignment);
router.get('/assignments/:assignmentId', getAssignmentById);
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.patch('/submissions/:submissionId/grade', gradeSubmission);
router.delete('/assignments/:id', deleteAssignment);

// Course Management Requests
router.post('/course-requests', submitCourseRequest);
router.get('/course-requests', getMyRequests);

// Feedback & Evaluations
router.get('/sections/:sectionId/evaluations', getEvaluations);
router.get('/evaluations/:formId/responses', getEvaluationResponses);
router.post('/sections/:sectionId/evaluations', createEvaluation);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);


export default router;
