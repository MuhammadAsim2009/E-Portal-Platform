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

export const getSectionStudents = async (req, res) => {
  try {
    const students = await facultyService.getSectionStudents(req.params.sectionId);
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateGrade = async (req, res) => {
  try {
    const result = await facultyService.updateGrade(req.params.enrollmentId, req.body.grade);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { date } = req.query;
    const records = await facultyService.getAttendance(sectionId, date);
    res.json(records);
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
    const assignments = await facultyService.getSectionAssignments(req.params.sectionId);
    res.json(assignments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createAssignment = async (req, res) => {
  try {
    const assignment = await facultyService.createAssignment({
      ...req.body,
      sectionId: req.params.sectionId,
      userId: req.user.id,
    });
    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
