import * as facultyService from '../services/faculty.service.js';
import { getSignedFileUrl } from '../services/s3Service.js';

export const getFacultyDashboard = async (req, res) => {
  try {
    const data = await facultyService.getFacultyDashboard(req.user.id);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getMyCourses = async (req, res) => {
  try {
    const courses = await facultyService.getMyCourses(req.user.id);
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await facultyService.getCourseById(req.user.id, req.params.id);
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getSectionStudents = async (req, res) => {
  try {
    const data = await facultyService.getSectionStudents(req.params.sectionId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateGrade = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { grade } = req.body;
    const result = await facultyService.updateGrade(enrollmentId, grade);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Dynamic Gradebook ---

export const getAssessmentComponents = async (req, res) => {
  try {
    const data = await facultyService.getAssessmentComponents(req.params.sectionId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createAssessmentComponent = async (req, res) => {
  try {
    const result = await facultyService.createAssessmentComponent(req.params.sectionId, req.body);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateAssessmentComponent = async (req, res) => {
  try {
    const result = await facultyService.updateAssessmentComponent(req.params.componentId, req.body);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteAssessmentComponent = async (req, res) => {
  try {
    const result = await facultyService.deleteAssessmentComponent(req.params.componentId);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getSectionGradebook = async (req, res) => {
  try {
    const data = await facultyService.getSectionGradebook(req.params.sectionId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateStudentMarks = async (req, res) => {
  try {
    const { enrollmentId, componentId } = req.params;
    const { marksObtained } = req.body;
    const result = await facultyService.updateStudentMarks(enrollmentId, componentId, marksObtained);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getGradeScale = async (req, res) => {
  try {
    const data = await facultyService.getGradeScale();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};



export const getAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { date } = req.query; // Expects YYYY-MM-DD
    const data = await facultyService.getAttendance(sectionId, date || new Date().toISOString().split('T')[0]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const submitAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { date, records } = req.body;
    const result = await facultyService.submitAttendance(sectionId, date, records, req.user.id);
    if (!result.success) {
      return res.status(400).json({ message: result.error || 'Failed to submit attendance' });
    }
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getSectionAssignments = async (req, res) => {
  try {
    const data = await facultyService.getSectionAssignments(req.params.sectionId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createAssignment = async (req, res) => {
  try {
    const result = await facultyService.createAssignment({ 
      ...req.body, 
      sectionId: req.params.sectionId, 
      userId: req.user.id 
    });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const submitCourseRequest = async (req, res) => {
  try {
    const result = await facultyService.submitCourseRequest(req.user.id, req.body);
    res.json(result);
  } catch (err) { 
    const status = (err.message.includes('Conflict') || err.message.includes('conflict')) ? 400 : 500;
    res.status(status).json({ message: err.message }); 
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await facultyService.getMyRequests(req.user.id);
    res.json(requests);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const data = await facultyService.getAssignmentById(req.params.assignmentId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const data = await facultyService.getAssignmentSubmissions(req.params.assignmentId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const gradeSubmission = async (req, res) => {
  try {
    const result = await facultyService.gradeSubmission(req.params.submissionId, req.body.marks, req.body.feedback, req.user.id);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteAssignment = async (req, res) => {
  try {
    const result = await facultyService.deleteAssignment(req.params.id);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
export const getEvaluations = async (req, res) => {
  try {
    const stats = await facultyService.getEvaluationStats(req.params.sectionId);
    res.json({ success: true, stats });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createEvaluation = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const form = await facultyService.createEvaluationForm(req.params.sectionId, title, description, questions);
    res.json({ success: true, form });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getEvaluationResponses = async (req, res) => {
  try {
    const responses = await facultyService.getEvaluationResponses(req.params.formId);
    res.json({ success: true, responses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await facultyService.getAnnouncements(req.user.id);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await facultyService.createAnnouncement(req.body, req.user.id);
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await facultyService.updateAnnouncement(id, req.body, req.user.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found or unauthorized' });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await facultyService.deleteAnnouncement(id, req.user.id);
    if (!result) return res.status(404).json({ message: 'Announcement not found or unauthorized' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { isRead, limit = 50 } = req.query;
    const notifications = await facultyService.getNotifications(req.user.id, { 
      isRead: isRead === undefined ? null : isRead === 'true',
      limit: parseInt(limit)
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await facultyService.markNotificationRead(id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getSubmissionSignedUrl = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { action = 'view' } = req.query;
    const submission = await facultyService.getSubmissionById(submissionId);
    if (!submission || !submission.file_url) {
      return res.status(404).json({ message: 'Submission file not found' });
    }
    const signedUrl = await getSignedFileUrl(submission.file_url, action);
    res.json({ url: signedUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
