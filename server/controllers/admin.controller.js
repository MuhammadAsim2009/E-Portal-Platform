import * as adminService from '../services/admin.service.js';
import { sendEmail } from '../services/email.service.js';

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Loosened regex to support more UUID versions if needed, though Postgres gen_random_uuid is v4
  const looseRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return looseRegex.test(uuid);
};

export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    await sendEmail({
      to: email,
      subject: 'Institutional SMTP Telemetry Test',
      text: 'This is a test alert to verify the integrity of your institutional mail relay configuration. If you received this, your SMTP settings are functional.',
      html: `
        <div style="font-family: sans-serif; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">SMTP Relay Success</h2>
          <p style="color: #475569; font-size: 14px;">This is a test alert to verify the integrity of your institutional mail relay configuration.</p>
          <p style="color: #475569; font-size: 14px;">If you received this, your SMTP settings are <strong>functional</strong>.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
            Institutional Command Center &bull; Automated Telemetry
          </div>
        </div>
      `
    });
    res.json({ success: true });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role = 'all', page = 1, limit = 15 } = req.query;
    const result = await adminService.getAllUsers({ role, page: parseInt(page), limit: parseInt(limit) });
    res.json(result);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.toggleUserStatus(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'TOGGLE_USER_STATUS',
      target: id,
      details: `User status changed to ${result.is_active ? 'Active' : 'Inactive'}`,
      ipAddress: req.ip
    });
    res.json(result);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await adminService.getPendingUsers();
    res.json(users);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.approveUser(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'APPROVE_USER',
      target: id,
      details: `Approved registration for user ID: ${id}`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.json({ message: 'User approved successfully', user_id: result.user_id });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.rejectUser(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'REJECT_USER',
      target: id,
      details: `Rejected registration for user ID: ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
    res.json({ message: 'User rejected successfully', user_id: result.user_id });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateUser(id, req.body);
    res.json(result);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    await adminService.logAction({
      userId: req.user.id,
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
      userId: req.user.id,
      action: 'CREATE_USER_ADMIN',
      target: user.user_id,
      details: `Admin manually created ${role} account for ${email}`,
      severity: 'info',
      ipAddress: req.ip
    });

    try {
      await sendEmail({
        to: email,
        subject: `Welcome to E-Portal - ${role.charAt(0).toUpperCase() + role.slice(1)} Account Created`,
        text: `Hello ${name}, your institutional account has been successfully provisioned. Link: ${process.env.CLIENT_URL || 'http://localhost:5173/login'}`,
        html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; padding: 40px; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px; tracking: -0.025em;">Welcome to the Portal, ${name}</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your institutional account has been successfully provisioned by the administrator. You can now access your dashboard using the credentials below.</p>
              
              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Account Identity</p>
                <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 16px; font-weight: 600;">${email}</p>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Access Role</p>
                <p style="margin: 4px 0 0 0; color: #4f46e5; font-size: 16px; font-weight: 700; text-transform: capitalize;">${role}</p>
              </div>

              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; width: 100%; text-align: center; background-color: #0f172a; color: #ffffff; padding: 16px 0; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.025em;">Sign In to Dashboard</a>
              
              <p style="margin-top: 32px; color: #94a3b8; font-size: 12px; text-align: center;">If you did not expect this account, please contact the IT helpdesk immediately.</p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('[AdminController] Notification failed for:', email, emailErr);
    }

    res.status(201).json(user);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
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

      try {
        await sendEmail({
          to: email,
          subject: 'Institutional Account Provisioned',
          text: `Hello ${name}, your account (${userRole}) has been created. Login at: ${process.env.CLIENT_URL || 'http://localhost:5173/login'}`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; border-radius: 15px; border: 1px solid #f1f5f9; background-color: #ffffff;">
              <h3 style="color: #0f172a;">Account Provisioned</h3>
              <p style="color: #475569; font-size: 14px;">Your institutional account has been created via bulk import.</p>
              <div style="padding: 15px; background: #f8fafc; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px;"><strong>User:</strong> ${name}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Role:</strong> ${userRole}</p>
              </div>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="color: #4f46e5; font-weight: bold; text-decoration: none;">Link to Dashboard &rarr;</a>
            </div>
          `
        });
      } catch (e) {
        console.error('[BulkCreate] Email failed for:', email);
      }
      
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await adminService.createCourse(req.body);
    if (!course) {
        return res.status(400).json({ message: 'Failed to create course. Please verify inputs.' });
    }
    await adminService.logAction({
      userId: req.user.id,
      action: 'CREATE_COURSE',
      target: course.course_id,
      details: `Registered new course: ${course.title} (${course.course_code})`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.status(201).json(course);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ message: 'Invalid course reference (ID is not a valid sequence)' });
    }
    const course = await adminService.updateCourse(id, req.body);
    if (!course) {
      return res.status(404).json({ message: 'Course not found or no changes made.' });
    }
    await adminService.logAction({
      userId: req.user.id,
      action: 'UPDATE_COURSE',
      target: id,
      details: `Modified curriculum details for course: ${course.title}`,
      severity: 'info',
      ipAddress: req.ip
    });
    res.json(course);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ message: 'Invalid course reference (ID is not a valid sequence)' });
    }
    await adminService.deleteCourse(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'DELETE_COURSE',
      target: id,
      details: `Withdrew course from catalog (ID: ${id})`,
      severity: 'warning',
      ipAddress: req.ip
    });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await adminService.getAnnouncements();
    res.json(announcements);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await adminService.createAnnouncement({
      ...req.body,
      adminId: req.user.id,
    });
    await adminService.logAction({
      userId: req.user.id,
      action: 'CREATE_ANNOUNCEMENT',
      target: announcement.announcement_id,
      details: `New announcement: ${announcement.title}`,
      ipAddress: req.ip
    });
    res.status(201).json(announcement);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await adminService.updateAnnouncement(id, req.body);
    await adminService.logAction({
      userId: req.user.id,
      action: 'UPDATE_ANNOUNCEMENT',
      target: id,
      details: `Updated announcement: ${announcement.title}`,
      ipAddress: req.ip
    });
    res.json(announcement);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAnnouncement(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'DELETE_ANNOUNCEMENT',
      target: id,
      details: `Deleted announcement ID: ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
    res.json({ message: 'Announcement deleted successfully', id: result.announcement_id });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getSections = async (req, res) => {
  try {
    const result = await adminService.getAllSections();
    res.json(result);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getFacultyList = async (req, res) => {
  try {
    const result = await adminService.getAllFaculty();
    res.json(result);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getSectionStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await adminService.getSectionStudents(id);
    res.json(students);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await adminService.getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, waiver_justification } = req.body;
    const payment = await adminService.updatePaymentStatus(id, status, waiver_justification);
    
    await adminService.logAction({
      userId: req.user.id,
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
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.markNotificationRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await adminService.getUnreadNotificationCount();
    res.json({ count });
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await adminService.getSiteSettings();
    res.json(settings);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await adminService.updateSiteSettings(req.body);
    await adminService.logAction({
      userId: req.user.id,
      action: 'UPDATE_SITE_SETTINGS',
      details: 'Modified global site configuration',
      ipAddress: req.ip
    });
    res.json(settings);
  } catch (err) {
    console.error(`[AdminController] ${req.route.path} Error:`, err);
    res.status(500).json({ 
      message: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

export const getFeeStructures = async (req, res) => {
  try {
    const structures = await adminService.getFeeStructures();
    res.json(structures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bulkGenerateFees = async (req, res) => {
  try {
    const result = await adminService.generateBulkFees(req.body);
    const { program, semester, course_id, section_id } = req.body;
    
    await adminService.logAction({
      userId: req.user.id,
      action: 'BULK_GENERATE_FEES',
      details: course_id ? `Generated fees for Course ${course_id} Section ${section_id}` : `Generated fees for program ${program} (${semester})`,
      ipAddress: req.ip
    });
    res.json({ message: `Successfully generated ${result.generatedCount} fee records.`, ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFeeStructure = async (req, res) => {
  try {
    const structure = await adminService.createFeeStructure(req.body);
    await adminService.logAction({
      userId: req.user.id,
      action: 'CREATE_FEE_STRUCTURE',
      target: structure.structure_id,
      details: `Created fee structure: ${structure.category} for ${structure.program} (${structure.semester})`,
      ipAddress: req.ip
    });
    res.status(201).json(structure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteFeeStructure(id);
    await adminService.logAction({
      userId: req.user.id,
      action: 'DELETE_FEE_STRUCTURE',
      target: id,
      details: `Deleted fee structure ID: ${id}`,
      severity: 'warning',
      ipAddress: req.ip
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await adminService.updateFeeStructure(id, req.body);
    await adminService.logAction({
      userId: req.user.id,
      action: 'UPDATE_FEE_STRUCTURE',
      target: id,
      details: `Modified fee configuration for ${structure.category}`,
      ipAddress: req.ip
    });
    res.json(structure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
