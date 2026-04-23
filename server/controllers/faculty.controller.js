import * as facultyService from '../services/faculty.service.js';

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
    const result = await facultyService.createAssignment({ ...req.body, userId: req.user.id });
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
