import * as courseService from '../services/course.service.js';
import * as studentService from '../services/student.service.js';

/**
 * Fetch the metrics for the student dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const data = await studentService.getStudentDashboard(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Student Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching student dashboard' });
  }
};

/**
 * Get catalog of available course sections
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const rows = await courseService.getAvailableSections();
    res.status(200).json(rows);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

/**
 * Enroll a student into a section
 */
export const enrollModule = async (req, res) => {
  try {
    const { sectionId } = req.body;
    
    // In actual implementation we'd grab studentId from the user's mapping.
    // For local mock demonstration, we'll assign a placeholder string if required.
    const studentId = 'stud_mock_id'; 
    const result = await courseService.enrollStudent(studentId, sectionId);
    
    res.status(200).json({ message: 'Successfully enrolled!', enrollment: result });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(400).json({ message: err.message || 'Enrollment failed' });
  }
};
