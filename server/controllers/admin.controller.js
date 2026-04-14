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
