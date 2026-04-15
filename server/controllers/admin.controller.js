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

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // We reuse the user service logic but specify it's admin created
    const passwordHash = await import('../services/auth.service.js').then(m => m.hashPassword(password));
    const user = await import('../services/user.service.js').then(m => m.createUser({ 
      name, email, passwordHash, role, is_admin_created: true 
    }));
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

export const getFinancialAnalytics = async (req, res) => {
  try {
    const stats = await adminService.getFinancialStats();
    const incomePerCourse = await adminService.getIncomePerCourse();
    res.json({ stats, incomePerCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
