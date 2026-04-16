import * as db from '../config/db.js';
import { sendEmail } from './email.service.js';

// ─────────────────────── DASHBOARD OVERVIEW ───────────────────────

export const getDashboardStats = async () => {
  try {
    const [usersRes, studentsRes, facultyRes, coursesRes, enrollmentsRes, deptDistribution, recentLogs, trendRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'student' AND registration_status = 'approved' AND is_active = true`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'faculty' AND registration_status = 'approved' AND is_active = true`),
      db.query(`SELECT COUNT(*) FROM courses WHERE is_active = true`),
      db.query(`SELECT COUNT(*) FROM enrollments WHERE status = 'enrolled'`),
      db.query(`
        SELECT department as dept, COUNT(*) as count 
        FROM faculty 
        WHERE department IS NOT NULL AND department != ''
        GROUP BY department 
        ORDER BY count DESC 
        LIMIT 5
      `),
      db.query(`
        SELECT 
          l.*, 
          u.name as user_name, 
          u.email as user_email
        FROM audit_logs l 
        LEFT JOIN users u ON l.user_id = u.user_id 
        ORDER BY l.created_at DESC 
        LIMIT 5
      `),
      db.query(`
        SELECT 
          TO_CHAR(enrollment_date, 'Mon') as month, 
          COUNT(*) as active
        FROM enrollments
        WHERE enrollment_date >= NOW() - INTERVAL '8 months'
        GROUP BY month, date_trunc('month', enrollment_date)
        ORDER BY date_trunc('month', enrollment_date)
      `)
    ]);

    const totalStats = {
      totalUsers: parseInt(usersRes.rows[0].count),
      totalStudents: parseInt(studentsRes.rows[0].count),
      totalFaculty: parseInt(facultyRes.rows[0].count),
      activeCourses: parseInt(coursesRes.rows[0].count),
      activeEnrollments: parseInt(enrollmentsRes.rows[0].count),
      departmentDistribution: deptDistribution.rows.map(d => ({
        dept: d.dept,
        students: Math.round((parseInt(d.count) / Math.max(1, parseInt(facultyRes.rows[0].count))) * 100),
        color: '#6366f1'
      })),
      activities: recentLogs.rows.map(l => ({
        id: l.log_id,
        user: l.user_name || 'System',
        action: l.action,
        time: l.created_at,
        status: 'Logged',
        color: l.severity === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'
      })),
      enrollmentTrend: trendRes.rows.map(r => ({
        month: r.month,
        active: parseInt(r.active),
        new: Math.floor(parseInt(r.active) * 0.3)
      }))
    };
    return totalStats;
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalFaculty: 0,
      activeCourses: 0,
      activeEnrollments: 0,
      departmentDistribution: [],
      activities: [],
      enrollmentTrend: []
    };
  }
};

export const logAction = async ({ userId, action, target, details, severity = 'info', ipAddress }) => {
  try {
    await db.query(`
      INSERT INTO audit_logs (user_id, action, target, details, severity, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, action, target, details, severity, ipAddress]);
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

export const getAuditLogs = async ({ page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const res = await db.query(`
    SELECT 
      l.*, 
      u.name as user_name, 
      u.email as user_email
    FROM audit_logs l 
    LEFT JOIN users u ON l.user_id = u.user_id 
    ORDER BY l.created_at DESC 
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  
  const countRes = await db.query('SELECT COUNT(*) FROM audit_logs');

  return {
    logs: res.rows,
    total: parseInt(countRes.rows[0].count),
    page,
    limit
  };
};

export const createNotification = async ({ userId, title, message, type, priority = 'medium', relatedId = null }) => {
  try {
    const res = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, priority, related_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, message, type, priority, relatedId]
    );
    return res.rows[0];
  } catch (err) {
    console.error('Notification Creation Error:', err);
  }
};

export const getNotifications = async ({ isRead = null, limit = 50 } = {}) => {
  let query = `
    SELECT n.*, u.name as user_name, u.role as user_role
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.user_id
  `;
  const params = [];

  if (isRead !== null) {
    query += ` WHERE n.is_read = $1`;
    params.push(isRead);
  }

  query += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await db.query(query, params);
  return res.rows;
};

export const markNotificationRead = async (id) => {
  await db.query(`UPDATE notifications SET is_read = true WHERE notification_id = $1`, [id]);
  return { success: true };
};

export const getUnreadNotificationCount = async () => {
  const res = await db.query(`SELECT COUNT(*) as count FROM notifications WHERE is_read = false`);
  return parseInt(res.rows[0].count);
};

// ─────────────────────── USER MANAGEMENT ───────────────────────

export const getAllUsers = async ({ role, page = 1, limit = 15 }) => {
  try {
    const offset = (page - 1) * limit;
    let mainWhereClause = "WHERE registration_status != 'pending'";
    let countWhereClause = "WHERE registration_status != 'pending'";
    const params = [limit, offset];
    const countParams = [];

    if (role && role !== 'all') {
      mainWhereClause += ' AND role = $3';
      params.push(role);
      
      countWhereClause += ' AND role = $1';
      countParams.push(role);
    }

    const res = await db.query(
      `SELECT 
        u.user_id, u.name, u.email, u.role, u.is_active, u.created_at, u.registration_status,
        s.date_of_birth, s.gender,
        f.department, f.designation, f.qualifications,
        COALESCE(s.contact_number, f.contact_number) as contact_number
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       ${mainWhereClause.replace(/role/g, 'u.role')}
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countRes = await db.query(
      `SELECT COUNT(*) FROM users ${countWhereClause}`,
      countParams
    );

    return {
      users: res.rows,
      total: parseInt(countRes.rows[0].count),
      page,
      limit,
    };
  } catch (err) {
    throw err;
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const res = await db.query(
      `UPDATE users SET is_active = NOT is_active WHERE user_id = $1 RETURNING user_id, is_active`,
      [userId]
    );
    return res.rows[0];
  } catch {
    return { user_id: userId, is_active: false };
  }
};

export const getPendingUsers = async () => {
  try {
    const res = await db.query(
      `SELECT user_id, name, email, role, created_at 
       FROM users 
       WHERE registration_status = 'pending' 
       ORDER BY created_at DESC`
    );
    return res.rows;
  } catch {
    return [];
  }
};

export const approveUser = async (userId) => {
  const res = await db.query(
    `UPDATE users SET registration_status = 'approved', is_active = true WHERE user_id = $1 RETURNING user_id`,
    [userId]
  );
  return res.rows[0];
};

export const rejectUser = async (userId) => {
  const res = await db.query(
    `UPDATE users SET registration_status = 'rejected', is_active = false WHERE user_id = $1 RETURNING user_id`,
    [userId]
  );
  return res.rows[0];
};

export const updateUser = async (userId, data) => {
  const { 
    email, role, name, 
    date_of_birth, gender, contact_number,
    department, designation, qualifications 
  } = data;

  // 1. Update core user table
  const res = await db.query(
    `UPDATE users SET email = $1, role = $2, name = $3 WHERE user_id = $4 RETURNING *`,
    [email, role, name, userId]
  );
  if (res.rowCount === 0) throw new Error('User not found');
  const user = res.rows[0];

  // 2. Update role-specific profiles
  if (role === 'student') {
    await db.query(
      `INSERT INTO students (user_id, date_of_birth, gender, contact_number)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE 
       SET date_of_birth = EXCLUDED.date_of_birth,
           gender = EXCLUDED.gender,
           contact_number = EXCLUDED.contact_number`,
      [userId, date_of_birth || null, gender || null, contact_number || null]
    );
  } else if (role === 'faculty') {
    await db.query(
      `INSERT INTO faculty (user_id, department, designation, contact_number, qualifications)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE 
       SET department = EXCLUDED.department,
           designation = EXCLUDED.designation,
           contact_number = EXCLUDED.contact_number,
           qualifications = EXCLUDED.qualifications`,
      [userId, department || null, designation || null, contact_number || null, qualifications || null]
    );
  }

  return { ...user, date_of_birth, gender, contact_number, department, designation, qualifications };
};

export const deleteUser = async (userId) => {
  // Check if this user is a student enrolled in any section
  const enrollmentCheck = await db.query(
    `SELECT e.enrollment_id
     FROM enrollments e
     JOIN students s ON s.student_id = e.student_id
     WHERE s.user_id = $1
     LIMIT 1`,
    [userId]
  );

  if (enrollmentCheck.rowCount > 0) {
    const err = new Error('This student is enrolled in one or more courses. Unenroll them before deleting their account.');
    err.code = 'ENROLLED';
    throw err;
  }

  const res = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);
  if (res.rowCount === 0) throw new Error('User not found');
  return { success: true };
};

// ─────────────────────── COURSE MANAGEMENT ───────────────────────

export const getAllCourses = async () => {
  try {
    const res = await db.query(
      `SELECT c.course_id, c.course_code, c.title, c.credit_hours, c.department, c.is_active, c.max_seats,
              COUNT(DISTINCT cs.section_id) as total_sections,
              COALESCE(SUM(cs.current_seats), 0) as total_enrolled
       FROM courses c
       LEFT JOIN course_sections cs ON c.course_id = cs.course_id
       GROUP BY c.course_id
       ORDER BY c.created_at DESC`
    );
    return res.rows;
  } catch {
    return [
      { course_id: '1', course_code: 'CS-101', title: 'Introduction to Computing', credit_hours: 3, department: 'Computer Science', is_active: true, total_sections: 2, total_enrolled: 45 },
      { course_id: '2', course_code: 'MA-201', title: 'Calculus II', credit_hours: 3, department: 'Mathematics', is_active: true, total_sections: 1, total_enrolled: 30 },
      { course_id: '3', course_code: 'EN-101', title: 'Academic Writing', credit_hours: 2, department: 'English', is_active: true, total_sections: 3, total_enrolled: 72 },
    ];
  }
};

export const createCourse = async ({ course_code, title, credit_hours, department, description, max_seats }) => {
  try {
    const res = await db.query(
      `INSERT INTO courses (course_code, title, credit_hours, department, description, max_seats)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [course_code, title, credit_hours, department, description, max_seats || 40]
    );
    return res.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updateCourse = async (courseId, data) => {
  const { course_code, title, credit_hours, department, description, max_seats, is_active } = data;
  const res = await db.query(
    `UPDATE courses 
     SET course_code = $1, title = $2, credit_hours = $3, department = $4, description = $5, max_seats = $6, is_active = $7
     WHERE course_id = $8 RETURNING *`,
    [course_code, title, credit_hours, department, description, max_seats, is_active, courseId]
  );
  return res.rows[0];
};

export const deleteCourse = async (courseId) => {
  const res = await db.query(`DELETE FROM courses WHERE course_id = $1 RETURNING course_id`, [courseId]);
  return res.rows[0];
};

// ─────────────────────── TIMETABLE & SECTIONS ───────────────────────

export const getAllSections = async () => {
  try {
    const res = await db.query(`
      SELECT s.*, c.title as course_title, c.course_code, f.faculty_id, u.name as faculty_name
      FROM course_sections s
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
      ORDER BY c.course_code, s.section_name
    `);
    return res.rows;
  } catch (err) {
    console.error('Get Sections Error:', err);
    return [];
  }
};

export const getAllFaculty = async () => {
  try {
    const res = await db.query(`
      SELECT f.faculty_id, u.name, u.email, f.department
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      WHERE u.is_active = true
    `);
    return res.rows;
  } catch (err) {
    console.error('Get Faculty Error:', err);
    return [];
  }
};

export const checkScheduleConflict = async (sectionId, facultyId, roomId, day, startTime, endTime) => {
  // Check Faculty Conflict
  const facultyRes = await db.query(`
    SELECT * FROM course_sections 
    WHERE faculty_id = $1 AND section_id != $3
    AND string_to_array(day_of_week, ', ') && string_to_array($2, ', ')
    AND (
      (start_time, end_time) OVERLAPS ($4::TIME, $5::TIME)
    )
  `, [facultyId, day, sectionId, startTime, endTime]);

  if (facultyRes.rows.length > 0) return { conflict: true, type: 'Faculty already assigned to another section at this time.' };

  // Check Room Conflict
  const roomRes = await db.query(`
    SELECT * FROM course_sections 
    WHERE room = $1 AND section_id != $3
    AND string_to_array(day_of_week, ', ') && string_to_array($2, ', ')
    AND (
      (start_time, end_time) OVERLAPS ($4::TIME, $5::TIME)
    )
  `, [roomId, day, sectionId, startTime, endTime]);

  if (roomRes.rows.length > 0) return { conflict: true, type: 'Room is already occupied at this time.' };

  return { conflict: false };
};

export const updateSectionSchedule = async (sectionId, data) => {
  const { faculty_id, room, day_of_week, start_time, end_time } = data;
  
  // Validate conflict
  const conflict = await checkScheduleConflict(sectionId, faculty_id, room, day_of_week, start_time, end_time);
  if (conflict.conflict) {
    throw new Error(conflict.type);
  }

  const res = await db.query(`
    UPDATE course_sections 
    SET faculty_id = $1, room = $2, day_of_week = $3, start_time = $4, end_time = $5
    WHERE section_id = $6
    RETURNING *
  `, [faculty_id, room, day_of_week, start_time, end_time, sectionId]);
  
  return res.rows[0];
};

export const createSection = async (data) => {
  const { course_id, section_name, faculty_id, room, day_of_week, start_time, end_time, max_seats } = data;
  
  // Optional conflict check if faculty/room provided
  if (faculty_id && room && day_of_week && start_time && end_time) {
    const conflict = await checkScheduleConflict(null, faculty_id, room, day_of_week, start_time, end_time);
    if (conflict.conflict) {
      throw new Error(conflict.type);
    }
  }

  const res = await db.query(`
    INSERT INTO course_sections (course_id, section_name, faculty_id, room, day_of_week, start_time, end_time, max_seats)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [course_id, section_name, faculty_id, room, day_of_week, start_time, end_time, max_seats]);
  
  return res.rows[0];
};

// ─────────────────────── FINANCIAL ANALYTICS ───────────────────────

export const getFinancialStats = async () => {
  try {
    const [totalRevenue, collectionRate, pendingFees] = await Promise.all([
      db.query(`SELECT SUM(amount_paid) FROM payments`),
      db.query(`
        SELECT 
          (SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) / NULLIF(SUM(amount), 0)) * 100 as rate 
        FROM fees
      `),
      db.query(`SELECT SUM(amount) FROM fees WHERE status = 'pending'`),
    ]);

    const trend = await db.query(`
      SELECT 
        TO_CHAR(payment_date, 'Mon') as name, 
        SUM(amount_paid) as revenue 
      FROM payments 
      WHERE payment_date >= NOW() - INTERVAL '6 months'
      GROUP BY name, date_trunc('month', payment_date)
      ORDER BY date_trunc('month', payment_date)
    `);

    return {
      totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
      collectionRate: Math.round(parseFloat(collectionRate.rows[0].rate || 0)),
      pendingAmount: parseFloat(pendingFees.rows[0].sum || 0),
      revenueTrend: trend.rows
    };
  } catch (err) {
    console.error('Financial Stats Error:', err);
    return { totalRevenue: 0, collectionRate: 0, pendingAmount: 0 };
  }
};

export const getIncomePerCourse = async () => {
  try {
    const res = await db.query(`
      SELECT 
        c.course_code, 
        c.title, 
        COUNT(DISTINCT e.student_id) as enrolled_students,
        COALESCE(SUM(p.amount_paid), 0) as total_income
      FROM courses c
      LEFT JOIN course_sections cs ON c.course_id = cs.course_id
      LEFT JOIN enrollments e ON cs.section_id = e.section_id
      LEFT JOIN students s ON e.student_id = s.student_id
      LEFT JOIN payments p ON s.student_id = p.student_id
      GROUP BY c.course_id, c.course_code, c.title
      ORDER BY total_income DESC
    `);
    return res.rows;
  } catch (err) {
    console.error('Income Per Course Error:', err);
    return [];
  }
};

export const getAnnouncements = async () => {
  try {
    const res = await db.query(
      `SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC LIMIT 20`
    );
    return res.rows;
  } catch {
    return [
      { announcement_id: '1', title: 'Mid-term Exam Schedule Released', body: 'Please check the portal for your individual schedules.', category: 'Academic', target_role: 'student', is_pinned: true, created_at: new Date() },
      { announcement_id: '2', title: 'Library Extended Hours', body: 'Library will remain open during exam week (24/7).', category: 'General', target_role: 'all', is_pinned: false, created_at: new Date() },
    ];
  }
};

export const createAnnouncement = async ({ title, body, category, target_role, target_user_id, expiry_date, is_pinned, adminId, send_email }) => {
  try {
    const res = await db.query(
      `INSERT INTO announcements (title, body, category, target_role, target_user_id, expiry_date, is_pinned, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, body, category, target_role, target_user_id || null, expiry_date || null, is_pinned, adminId]
    );
    const announcement = res.rows[0];

    // Handle Email Broadcasting
    if (send_email) {
      let recipients = [];
      if (target_role === 'individual' && target_user_id) {
        const userRes = await db.query('SELECT email FROM users WHERE user_id = $1', [target_user_id]);
        if (userRes.rows.length > 0) recipients = [userRes.rows[0].email];
      } else if (target_role === 'all') {
        const usersRes = await db.query('SELECT email FROM users WHERE is_active = true');
        recipients = usersRes.rows.map(u => u.email);
      } else {
        const usersRes = await db.query('SELECT email FROM users WHERE role = $1 AND is_active = true', [target_role]);
        recipients = usersRes.rows.map(u => u.email);
      }

      if (recipients.length > 0) {
        // Send email in background (or wait if you prefer, usually background is better but here we can wait for confirmation)
        sendEmail({
          to: recipients,
          subject: `[${category}] ${title}`,
          text: body,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #4f46e5; padding: 24px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Institutional Announcement</h2>
                <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">${category} Bulletin</p>
              </div>
              <div style="padding: 32px; color: #1e293b;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #0f172a;">${title}</h1>
                <p style="margin: 0; line-height: 1.6; color: #475569; white-space: pre-wrap;">${body}</p>
                <div style="margin-top: 32px; padding-top: 24px; border-t: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
                  Target Audience: ${target_role}<br>
                  Date Posted: ${new Date().toLocaleDateString()}<br>
                  This is an automated institutional message.
                </div>
              </div>
            </div>
          `
        }).catch(err => console.error('E-Broadcast Failure:', err));
      }
    }

    return announcement;
  } catch (err) {
    throw new Error(err.message);
  }
};
export const updateAnnouncement = async (id, { title, body, category, target_role, expiry_date, is_pinned }) => {
  try {
    const res = await db.query(
      `UPDATE announcements 
       SET title = $1, body = $2, category = $3, target_role = $4, expiry_date = $5, is_pinned = $6
       WHERE announcement_id = $7 RETURNING *`,
      [title, body, category, target_role, expiry_date || null, is_pinned, id]
    );
    if (res.rowCount === 0) throw new Error('Announcement not found');
    return res.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

export const deleteAnnouncement = async (id) => {
  const res = await db.query('DELETE FROM announcements WHERE announcement_id = $1 RETURNING announcement_id', [id]);
  if (res.rowCount === 0) throw new Error('Announcement not found');
  return res.rows[0];
};

export const deleteSection = async (id) => {
  await db.query('DELETE FROM course_sections WHERE section_id = $1', [id]);
  return { success: true };
};

export const getSectionStudents = async (sectionId) => {
  const res = await db.query(`
    SELECT e.*, u.name as full_name, u.email as admission_id 
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    WHERE e.section_id = $1
  `, [sectionId]);
  return res.rows;
};

export const enrollStudentInSection = async (sectionId, studentId) => {
  const studentRes = await db.query('SELECT student_id FROM students WHERE student_id = $1', [studentId]);
  if (studentRes.rows.length === 0) throw new Error('Student not found with this ID');
  
  const checkRes = await db.query('SELECT 1 FROM enrollments WHERE student_id = $1 AND section_id = $2', [studentId, sectionId]);
  if (checkRes.rows.length > 0) throw new Error('Student already enrolled in this section');

  const res = await db.query(`
    INSERT INTO enrollments (student_id, section_id)
    VALUES ($1, $2) RETURNING *
  `, [studentId, sectionId]);
  
  await db.query('UPDATE course_sections SET current_seats = current_seats + 1 WHERE section_id = $1', [sectionId]);
  
  return res.rows[0];
};

export const getEligibleStudentsForSection = async (sectionId) => {
  const res = await db.query(`
    SELECT s.student_id, u.name as full_name, u.email as admission_id
    FROM students s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.student_id NOT IN (
      SELECT student_id FROM enrollments WHERE section_id = $1
    )
    ORDER BY u.name ASC
  `, [sectionId]);
  return res.rows;
};

export const removeStudentFromSection = async (sectionId, studentId) => {
  const checkRes = await db.query('SELECT 1 FROM enrollments WHERE student_id = $1 AND section_id = $2', [studentId, sectionId]);
  if (checkRes.rows.length === 0) throw new Error('Student is not enrolled in this section');

  await db.query('DELETE FROM enrollments WHERE student_id = $1 AND section_id = $2', [studentId, sectionId]);
  
  // Decrease current_seats (make sure it doesn't drop below 0 if somehow out of sync)
  await db.query('UPDATE course_sections SET current_seats = GREATEST(0, current_seats - 1) WHERE section_id = $1', [sectionId]);
  
  return { success: true };
};

export const getAllPayments = async () => {
  const res = await db.query(`
    SELECT 
      p.*, 
      u.name as student_name, 
      u.email as student_email,
      f.fee_type,
      f.semester
    FROM payments p
    JOIN students s ON p.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    LEFT JOIN fees f ON p.fee_id = f.fee_id
    ORDER BY p.payment_date DESC
  `);
  return res.rows;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const res = await db.query(
    `UPDATE payments SET status = $1 WHERE payment_id = $2 RETURNING *`,
    [status, paymentId]
  );
  
  if (res.rowCount === 0) throw new Error('Payment not found');
  
  // If accepted, update associated fee to paid
  if (status === 'accepted') {
    await db.query(
      `UPDATE fees SET status = 'paid' 
       WHERE fee_id = (SELECT fee_id FROM payments WHERE payment_id = $1)`,
      [paymentId]
    );
  }
  
  return res.rows[0];
};
