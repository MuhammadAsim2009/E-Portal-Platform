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
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'TOGGLE_USER_STATUS',
      target: id,
      details: `User status changed to ${result.is_active ? 'Active' : 'Inactive'}`,
      ipAddress: req.ip
    });
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
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'APPROVE_USER',
      target: id,
      details: `Approved registration for user ID: ${id}`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.json({ message: 'User approved successfully', user_id: result.user_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.rejectUser(id);
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'REJECT_USER',
      target: id,
      details: `Rejected registration for user ID: ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
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
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'DELETE_USER',
      target: id,
      details: `Permanently deleted user account ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
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
    const { 
      name, email, password, role, 
      date_of_birth, gender, contact_number,
      department, designation, qualifications 
    } = req.body;
    const passwordHash = await import('../services/auth.service.js').then(m => m.hashPassword(password));
    const user = await import('../services/user.service.js').then(m => m.createUser({ 
      name, email, passwordHash, role, is_admin_created: true,
      date_of_birth, gender, contact_number,
      department, designation, qualifications
    }));
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'CREATE_USER_ADMIN',
      target: user.user_id,
      details: `Admin manually created ${role} account for ${email}`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bulkCreateUsers = async (req, res) => {
  const users = req.body; // Array of { name, email, password, role, ...profile_fields }
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'No user records provided.' });
  }

  const authService = await import('../services/auth.service.js');
  const userService = await import('../services/user.service.js');

  const results = { success: [], failed: [] };

  for (const row of users) {
    const { 
      name, email, password, role, 
      date_of_birth, gender, contact_number,
      department, designation, qualifications 
    } = row;

    if (!name || !email || !password) {
      results.failed.push({ email: email || '(missing)', reason: 'Name, email, and password are required.' });
      continue;
    }

    try {
      const passwordHash = await authService.hashPassword(password);
      const userRole = role || 'student'; // Default to student
      
      await userService.createUser({
        name, email, passwordHash, role: userRole, is_admin_created: true,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        contact_number: contact_number || null,
        department: department || null,
        designation: designation || null,
        qualifications: qualifications || null
      });
      results.success.push(email);
    } catch (err) {
      results.failed.push({ email, reason: err.message });
    }
  }

  res.status(207).json({
    message: `${results.success.length} user(s) added, ${results.failed.length} failed.`,
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
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'CREATE_COURSE',
      target: course.course_id,
      details: `Registered new course: ${course.title} (${course.course_code})`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await adminService.updateCourse(id, req.body);
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'UPDATE_COURSE',
      target: id,
      details: `Modified curriculum details for course: ${course.title}`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteCourse(id);
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'DELETE_COURSE',
      target: id,
      details: `Withdrew course from catalog (ID: ${id})`,
      severity: 'warning',
      ipAddress: req.ip
    });
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
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'CREATE_ANNOUNCEMENT',
      target: announcement.announcement_id,
      details: `New announcement: ${announcement.title}`,
      ipAddress: req.ip
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await adminService.updateAnnouncement(id, req.body);
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'UPDATE_ANNOUNCEMENT',
      target: id,
      details: `Updated announcement: ${announcement.title}`,
      ipAddress: req.ip
    });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAnnouncement(id);
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'DELETE_ANNOUNCEMENT',
      target: id,
      details: `Deleted announcement ID: ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
    res.json({ message: 'Announcement deleted successfully', id: result.announcement_id });
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

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await adminService.getAuditLogs({ 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await adminService.getAllPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const payment = await adminService.updatePaymentStatus(id, status);
    
    await adminService.logAction({
      userId: req.user.user_id,
      action: 'UPDATE_PAYMENT_STATUS',
      target: id,
      details: `Payment status updated to ${status} for transaction ${payment.transaction_id}`,
      severity: status === 'rejected' ? 'warning' : 'info',
      ipAddress: req.ip
    });

    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { isRead, limit = 50 } = req.query;
    const notifications = await adminService.getNotifications({ 
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
    await adminService.markNotificationRead(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await adminService.getUnreadNotificationCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
