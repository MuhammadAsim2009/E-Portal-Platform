import * as adminService from '../services/admin.service.js';

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role = 'all', page = 1, limit = 15 } = req.query;
    const result = await adminService.getAllUsers({ role, page: parseInt(page), limit: parseInt(limit) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.toggleUserStatus(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await adminService.getPendingUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.approveUser(id);
    res.json({ message: 'User approved successfully', user_id: result.user_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.rejectUser(id);
    res.json({ message: 'User rejected successfully', user_id: result.user_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateUser(id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.code === 'ENROLLED') {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, date_of_birth, gender, contact_number } = req.body;
    const passwordHash = await import('../services/auth.service.js').then(m => m.hashPassword(password));
    const user = await import('../services/user.service.js').then(m => m.createUser({ 
      name, email, passwordHash, role, is_admin_created: true,
      date_of_birth, gender, contact_number
    }));
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bulkCreateStudents = async (req, res) => {
  const students = req.body; // Array of { name, email, password, date_of_birth, gender, contact_number }
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'No student records provided.' });
  }

  const authService = await import('../services/auth.service.js');
  const userService = await import('../services/user.service.js');

  const results = { success: [], failed: [] };

  for (const row of students) {
    const { name, email, password, date_of_birth, gender, contact_number } = row;
    if (!name || !email || !password) {
      results.failed.push({ email: email || '(missing)', reason: 'Name, email, and password are required.' });
      continue;
    }
    try {
      const passwordHash = await authService.hashPassword(password);
      await userService.createUser({
        name, email, passwordHash, role: 'student', is_admin_created: true,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        contact_number: contact_number || null,
      });
      results.success.push(email);
    } catch (err) {
      results.failed.push({ email, reason: err.message });
    }
  }

  res.status(207).json({
    message: `${results.success.length} student(s) added, ${results.failed.length} failed.`,
    ...results,
  });
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await adminService.getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await adminService.createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await adminService.updateCourse(id, req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteCourse(id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await adminService.getAnnouncements();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await adminService.createAnnouncement({
      ...req.body,
      adminId: req.user.user_id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSections = async (req, res) => {
  try {
    const result = await adminService.getAllSections();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFacultyList = async (req, res) => {
  try {
    const result = await adminService.getAllFaculty();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSectionSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateSectionSchedule(id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const section = await adminService.createSection(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteSection(id);
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSectionStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await adminService.getSectionStudents(id);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;
    const result = await adminService.enrollStudentInSection(id, student_id);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getEligibleStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await adminService.getEligibleStudentsForSection(id);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const result = await adminService.removeStudentFromSection(id, studentId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFinancialAnalytics = async (req, res) => {
  try {
    const stats = await adminService.getFinancialStats();
    const incomePerCourse = await adminService.getIncomePerCourse();
    res.json({ stats, incomePerCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
