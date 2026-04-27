import * as db from '../config/db.js';
import { sendEmail } from './email.service.js';
import { notify } from './notification.service.js';

// Helper to normalize day strings (e.g., "Mon-Fri" or "Mon, Wed") into an array of day abbreviations
const normalizeDays = (dayStr) => {
  if (!dayStr) return [];
  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let parts = dayStr.split(/[,/| ]+/).map(p => p.trim().toLowerCase()).filter(p => p);
  let expanded = [];
  parts.forEach(p => {
    if (p.includes('-')) {
      const [start, end] = p.split('-').map(s => s.trim().substring(0, 3));
      const sIdx = daysOrder.findIndex(d => d.toLowerCase() === start);
      const eIdx = daysOrder.findIndex(d => d.toLowerCase() === end);
      if (sIdx !== -1 && eIdx !== -1 && sIdx <= eIdx) {
        for (let i = sIdx; i <= eIdx; i++) expanded.push(daysOrder[i]);
      } else if (sIdx !== -1) expanded.push(daysOrder[sIdx]);
    } else {
      const match = daysOrder.find(d => d.toLowerCase().startsWith(p.substring(0, 3)));
      if (match) expanded.push(match);
    }
  });
  return [...new Set(expanded)];
};

// ─────────────────────── DASHBOARD OVERVIEW ───────────────────────

export const getDashboardStats = async () => {
  try {
    const [usersRes, studentsRes, facultyRes, coursesRes, enrollmentsRes, deptDistribution, recentLogs, trendRes, capacityRes] = await Promise.all([
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
      `),
      db.query(`
        SELECT SUM(c.max_seats) as total_capacity
        FROM course_sections cs
        JOIN courses c ON cs.course_id = c.course_id
      `)
    ]);

    const totalStudentsCount = parseInt(studentsRes.rows[0].count || 0);
    const activeEnrollments = parseInt(enrollmentsRes.rows[0].count || 0);
    const totalCapacity = parseInt(capacityRes.rows[0].total_capacity || 0);

    const totalStats = {
      totalUsers: parseInt(usersRes.rows[0].count || 0),
      totalStudents: totalStudentsCount,
      totalFaculty: parseInt(facultyRes.rows[0].count || 0),
      activeCourses: parseInt(coursesRes.rows[0].count || 0),
      activeEnrollments,
      totalCapacity,
      seatUtilization: totalCapacity > 0 ? Math.round((activeEnrollments / totalCapacity) * 100) : 0,
      departmentDistribution: deptDistribution.rows.map(d => ({
        dept: d.dept || 'General',
        students: totalStudentsCount > 0 ? Math.round((parseInt(d.count || 0) / totalStudentsCount) * 100) : 0,
        color: '#6366f1'
      })),
      activities: recentLogs.rows.map(l => ({
        id: l.log_id,
        user: l.user_name || 'System',
        action: l.action,
        time: l.created_at,
        severity: l.severity || 'info', 
        color: l.severity === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'
      })),
      enrollmentTrend: trendRes.rows.map(r => ({
        month: r.month,
        active: parseInt(r.active || 0),
        new: Math.floor(parseInt(r.active || 0) * 0.3)
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

export const logAction = async ({ userId, action, target, targetId, details, severity = 'info', ipAddress }) => {
  try {
    const finalTarget = target || targetId || 'SYSTEM';
    await db.query(`
      INSERT INTO audit_logs (user_id, action, target, details, severity, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, action, finalTarget, details, severity, ipAddress]);
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

export const markAllNotificationsRead = async () => {
  await db.query(`UPDATE notifications SET is_read = true WHERE is_read = false`);
  return { success: true };
};

export const getUnreadNotificationCount = async () => {
  try {
    const res = await db.query(`SELECT COUNT(*) as count FROM notifications WHERE is_read = false`);
    return parseInt(res.rows[0].count);
  } catch (err) {
    console.error('Failed to fetch unread notification count:', err.message);
    return 0;
  }
};

// ─────────────────────── BULK ENROLLMENT ───────────────────────

export const createBulkUsers = async (usersData, adminId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const results = { successful: [], failed: [] };

    for (const userData of usersData) {
      try {
        const { name, email, role, password, ...profileData } = userData;
        
        // 1. Create Core User
        const userRes = await client.query(
          `INSERT INTO users (name, email, role, password, registration_status, is_active)
           VALUES ($1, $2, $3, $4, 'approved', true) 
           RETURNING user_id, name, email`,
          [name, email, role, password || 'Student123!'] // Default password if not provided
        );
        const userId = userRes.rows[0].user_id;

        // Send Notification Email
        await sendEmail({
          to: email,
          subject: 'Account Created - E-Portal Platform',
          text: `Hello ${name}, your account has been created on E-Portal. Your role is ${role}.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="color: #4f46e5;">Welcome to E-Portal</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your institutional account has been successfully created by the administrator.</p>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Role:</strong> ${role.toUpperCase()}</p>
                <p style="margin: 4px 0 0 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0 0 0;"><strong>Default Password:</strong> ${password || 'Student123!'}</p>
              </div>
              <p>Please login and change your password immediately.</p>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">This is an automated message. Please do not reply.</p>
            </div>
          `
        }).catch(err => console.error('Create User Email Error:', err));

        // 2. Create Profile
        if (role === 'student') {
          await client.query(
            `INSERT INTO students (user_id, dob, gender, address) VALUES ($1, $2, $3, $4)`,
            [userId, profileData.dob || null, profileData.gender || null, profileData.address || null]
          );
        } else if (role === 'faculty') {
          await client.query(
            `INSERT INTO faculty (user_id, department, designation) VALUES ($1, $2, $3)`,
            [userId, profileData.department || null, profileData.designation || null]
          );
        }

        results.successful.push({ email, name });
      } catch (err) {
        results.failed.push({ email: userData.email, reason: err.message });
      }
    }

    if (results.successful.length > 0) {
      await logAction({
        userId: adminId,
        action: 'BATCH_ENROLLMENT',
        target: 'USERS',
        details: `Batch enrolled ${results.successful.length} users successfully. ${results.failed.length} failed.`,
        severity: 'info'
      });
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────── USER MANAGEMENT ───────────────────────

export const getAllUsers = async ({ role, page = 1, limit = 15 }) => {
  try {
    const offset = (page - 1) * limit;

    // Build WHERE clause with fully-qualified column names to prevent ambiguity
    let whereClause = "WHERE u.registration_status != 'pending'";
    const params = [limit, offset];

    if (role && role !== 'all') {
      whereClause += ` AND u.role = $${params.length + 1}`;
      params.push(role);
    }

    const res = await db.query(
      `SELECT 
        u.user_id, u.name, u.email, u.role, u.is_active, u.created_at, u.registration_status,
        s.student_id, f.faculty_id,
        s.date_of_birth, s.gender,
        f.department, f.designation, f.qualifications,
        COALESCE(s.contact_number, f.contact_number) as contact_number,
        CASE WHEN u.role = 'student' THEN
          EXISTS(SELECT 1 FROM fees fe WHERE fe.student_id = s.student_id AND fe.status = 'pending' AND fe.due_date < NOW())
        ELSE false END as is_delinquent
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    // Separate count query — no joins needed so no ambiguity risk
    let countClause = "WHERE registration_status != 'pending'";
    const countParams = [];
    if (role && role !== 'all') {
      countClause += ` AND role = $${countParams.length + 1}`;
      countParams.push(role);
    }

    const countRes = await db.query(
      `SELECT COUNT(*) FROM users ${countClause}`,
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
              (SELECT COUNT(DISTINCT section_id) FROM course_sections WHERE course_id = c.course_id) as total_sections,
              (SELECT COUNT(*) FROM enrollments e 
               JOIN course_sections cs ON e.section_id = cs.section_id 
               WHERE cs.course_id = c.course_id AND e.status = 'enrolled') as total_enrolled
       FROM courses c
       ORDER BY c.created_at DESC`
    );

    return res.rows;
  } catch (err) {
    console.error('Database Error in getAllCourses:', err);
    throw err;
  }
};

export const createCourse = async (data) => {
  try {
    const { course_code, title, credit_hours, department, description, max_seats } = data;
    const res = await db.query(
      `INSERT INTO courses (course_code, title, credit_hours, department, description, max_seats)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [course_code, title, credit_hours, department, description, (max_seats !== undefined && max_seats !== null) ? max_seats : 50]
    );
    return res.rows[0];
  } catch (err) {
    console.error('Error in createCourse service:', err.message);
    throw new Error(err.message);
  }
};

export const updateCourse = async (courseId, data) => {
  try {
    const { course_code, title, credit_hours, department, description, is_active, max_seats } = data;
    // Default is_active to true if not provided to prevent PG errors
    const activeStatus = is_active !== undefined ? is_active : true;
    const res = await db.query(
      `UPDATE courses 
       SET course_code = $1, title = $2, credit_hours = $3, department = $4, description = $5, is_active = $6, max_seats = $7
       WHERE course_id = $8 RETURNING *`,
      [course_code, title, credit_hours, department, description, activeStatus, (max_seats !== undefined && max_seats !== null) ? max_seats : 50, courseId]
    );
    return res.rows[0];
  } catch (err) {
    console.error(`Error updating course ${courseId}:`, err.message);
    throw err;
  }
};

export const deleteCourse = async (courseId) => {
  const res = await db.query(`DELETE FROM courses WHERE course_id = $1 RETURNING course_id`, [courseId]);
  return res.rows[0];
};

// ─────────────────────── TIMETABLE & SECTIONS ───────────────────────

export const getAllSections = async () => {
  try {
    const res = await db.query(`
      SELECT 
        s.section_id, s.course_id, s.faculty_id, s.section_name, s.room,
        s.day_of_week, 
        TO_CHAR(s.start_time, 'HH12:MI AM') as start_time, 
        TO_CHAR(s.end_time, 'HH12:MI AM') as end_time,
        c.title as course_title, c.course_code,
        c.max_seats,
        (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.section_id AND e.status = 'enrolled') as current_seats,
        f.faculty_id as fac_id, u.name as faculty_name
      FROM course_sections s
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
      ORDER BY c.course_code, s.section_name
    `);
    return res.rows;
  } catch (err) {
    console.error('Get Sections Error:', err);
    throw err;
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
    throw err;
  }
};

export const checkScheduleConflict = async (sectionId, facultyId, roomId, day, startTime, endTime) => {
  // Check Faculty Conflict
  const facultyRes = await db.query(`
    SELECT * FROM course_sections 
    WHERE faculty_id = $1 
    AND ($3::TEXT IS NULL OR section_id::TEXT != $3::TEXT)
    AND string_to_array(day_of_week, ', ') && string_to_array($2, ', ')
    AND (
      (start_time::TIME, end_time::TIME) OVERLAPS ($4::TIME, $5::TIME)
    )
  `, [facultyId, day, sectionId, startTime, endTime]);

  if (facultyRes.rows.length > 0) return { conflict: true, type: 'Selected teacher is already assigned to another class at this time/day.' };

  // Check Room Conflict
  const roomRes = await db.query(`
    SELECT * FROM course_sections 
    WHERE room = $1 
    AND ($3::TEXT IS NULL OR section_id::TEXT != $3::TEXT)
    AND string_to_array(day_of_week, ', ') && string_to_array($2, ', ')
    AND (
      (start_time::TIME, end_time::TIME) OVERLAPS ($4::TIME, $5::TIME)
    )
  `, [roomId, day, sectionId, startTime, endTime]);

  if (roomRes.rows.length > 0) return { conflict: true, type: 'Selected room is already occupied at this time/day.' };

  return { conflict: false };
};

export const updateSectionSchedule = async (sectionId, data) => {
  const { faculty_id, room, day_of_week, start_time, end_time } = data;
  
  // Validate conflict
  const conflict = await checkScheduleConflict(sectionId, faculty_id, room, day_of_week, start_time, end_time);
  if (conflict.conflict) {
    throw new Error(conflict.type);
  }

  const updated = await db.query(`
    UPDATE course_sections 
    SET faculty_id = $1, room = $2, day_of_week = $3, start_time = $4, end_time = $5
    WHERE section_id = $6
    RETURNING *
  `, [faculty_id, room, day_of_week, start_time, end_time, sectionId]);

  const fullData = await db.query(`
    SELECT s.*, c.title as course_title, c.course_code, f.faculty_id, u.name as faculty_name
    FROM course_sections s
    JOIN courses c ON s.course_id = c.course_id
    LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
    LEFT JOIN users u ON f.user_id = u.user_id
    WHERE s.section_id = $1
  `, [sectionId]);
  
  return fullData.rows[0];
};

export const createSection = async (data) => {
  const { course_id, section_name, faculty_id, room, day_of_week, start_time, end_time } = data;
  
  // Optional conflict check if faculty/room provided
  if (faculty_id && room && day_of_week && start_time && end_time) {
    const conflict = await checkScheduleConflict(null, faculty_id, room, day_of_week, start_time, end_time);
    if (conflict.conflict) {
      throw new Error(conflict.type);
    }
  }

  const res = await db.query(`
    INSERT INTO course_sections (course_id, section_name, faculty_id, room, day_of_week, start_time, end_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING section_id
  `, [course_id, section_name, faculty_id, room, day_of_week, start_time, end_time]);
  
  const fullData = await db.query(`
    SELECT 
      s.section_id, s.course_id, s.faculty_id, s.section_name, s.room,
      s.day_of_week, s.start_time, s.end_time,
      c.title as course_title, c.course_code,
      c.max_seats,
      0 as current_seats,
      f.faculty_id as fac_id, u.name as faculty_name
    FROM course_sections s
    JOIN courses c ON s.course_id = c.course_id
    LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
    LEFT JOIN users u ON f.user_id = u.user_id
    WHERE s.section_id = $1
  `, [res.rows[0].section_id]);

  return fullData.rows[0];
};

// ─────────────────────── FINANCIAL ANALYTICS ───────────────────────

export const getFinancialStats = async () => {
  try {
    const [totalRevenue, collectionRate, pendingFees] = await Promise.all([
      db.query(`
        SELECT SUM(p.amount_paid) 
        FROM payments p
        LEFT JOIN fees f ON p.fee_id = f.fee_id
        LEFT JOIN enrollments e ON f.student_id = e.student_id AND f.section_id = e.section_id
        WHERE p.status = 'accepted'
        AND (e.status IS NULL OR e.status != 'dropped')
      `),
      db.query(`
        SELECT 
          (SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) / NULLIF(SUM(amount), 0)) * 100 as rate 
        FROM fees
      `),
      db.query(`SELECT SUM(amount) FROM fees WHERE status = 'pending'`),
    ]);

    const trend = await db.query(`
      SELECT 
        TO_CHAR(p.payment_date, 'Mon') as name, 
        SUM(p.amount_paid) as revenue 
      FROM payments p
      LEFT JOIN fees f ON p.fee_id = f.fee_id
      LEFT JOIN enrollments e ON f.student_id = e.student_id AND f.section_id = e.section_id
      WHERE p.payment_date >= NOW() - INTERVAL '6 months'
      AND p.status = 'accepted'
      AND (e.status IS NULL OR e.status != 'dropped')
      GROUP BY name, date_trunc('month', p.payment_date)
      ORDER BY date_trunc('month', p.payment_date)
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
        COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'enrolled') as enrolled_students,
        COALESCE(SUM(p.amount_paid) FILTER (WHERE p.status = 'accepted' AND e.status = 'enrolled'), 0) as total_income
      FROM courses c
      LEFT JOIN course_sections cs ON c.course_id = cs.course_id
      LEFT JOIN enrollments e ON cs.section_id = e.section_id
      LEFT JOIN fees f ON e.student_id = f.student_id AND e.section_id = f.section_id
      LEFT JOIN payments p ON f.fee_id = p.fee_id
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
      { announcement_id: '550e8400-e29b-41d4-a716-446655440101', title: 'Mid-term Exam Schedule Released', body: 'Please check the portal for your individual schedules.', category: 'Academic', target_role: 'student', is_pinned: true, created_at: new Date() },
      { announcement_id: '550e8400-e29b-41d4-a716-446655440102', title: 'Library Extended Hours', body: 'Library will remain open during exam week (24/7).', category: 'General', target_role: 'all', is_pinned: false, created_at: new Date() },
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
        // Send email in background
        sendEmail({
          to: recipients,
          subject: title,
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
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
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

    // --- IN-APP NOTIFICATION BROADCAST ---
    if (target_role === 'individual' && target_user_id) {
       await createNotification({ userId: target_user_id, title, message: body, type: 'system', priority: 'medium', relatedId: announcement.announcement_id });
    } else if (target_role === 'all') {
       const uRes = await db.query("SELECT user_id FROM users WHERE is_active = true");
       for (const u of uRes.rows) {
         await createNotification({ userId: u.user_id, title, message: body, type: 'system', priority: 'medium', relatedId: announcement.announcement_id });
       }
    } else {
       const uRes = await db.query("SELECT user_id FROM users WHERE role = $1 AND is_active = true", [target_role]);
       for (const u of uRes.rows) {
         await createNotification({ userId: u.user_id, title, message: body, type: 'system', priority: 'medium', relatedId: announcement.announcement_id });
       }
    }
    // -------------------------------------

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
  
  // Financial Safety Valve: Check for delinquent fees
  const feeSql = `SELECT count(*) FROM fees WHERE student_id = $1 AND status = 'pending' AND due_date < NOW()`;
  const feeRes = await db.query(feeSql, [studentId]);
  if (parseInt(feeRes.rows[0].count) > 0) {
    throw new Error('Administrative enrollment blocked: This student has outstanding delinquent fees. Financial settlement is required before further enrollment.');
  }

  const checkRes = await db.query('SELECT status FROM enrollments WHERE student_id = $1 AND section_id = $2', [studentId, sectionId]);
  if (checkRes.rows.length > 0) {
    const status = checkRes.rows[0].status;
    if (status === 'enrolled') throw new Error('Student is already enrolled in this section');
    if (status === 'pending') throw new Error('Student already has a pending enrollment request for this section');
  }

  // Capacity guard (verified before enrollment/re-activation)
  const capacityRes = await db.query(`
    SELECT c.max_seats,
           (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = $1 AND e.status = 'enrolled') as current_count
    FROM course_sections cs
    JOIN courses c ON cs.course_id = c.course_id
    WHERE cs.section_id = $1
  `, [sectionId]);

  if (capacityRes.rows.length > 0) {
    const { max_seats, current_count } = capacityRes.rows[0];
    if (max_seats && parseInt(current_count) >= parseInt(max_seats)) {
      throw new Error(`Section is full. Maximum capacity is ${max_seats} students.`);
    }
  }

  // Atomic Create or Update (e.g. if student was 'dropped')
  const res = await db.query(`
    INSERT INTO enrollments (student_id, section_id, status, enrollment_date)
    VALUES ($1, $2, 'enrolled', NOW())
    ON CONFLICT (student_id, section_id) 
    DO UPDATE SET 
      status = 'enrolled', 
      enrollment_date = NOW()
    RETURNING *
  `, [studentId, sectionId]);
  
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
  
  return { success: true };
};

export const getAllPayments = async () => {
  const res = await db.query(`
    SELECT * FROM (
      SELECT DISTINCT ON (p.payment_id)
        p.*,
        u.name as student_name,
        u.email as student_email,
        s.student_id as admission_id,
        s.date_of_birth,
        s.contact_number as student_phone,
        f.fee_type,
        f.semester,
        e.enrollment_id,
        e.status as enrollment_status,
        e.enrollment_date,
        c.title as course_title,
        c.course_code,
        cs.section_name,
        cs.day_of_week,
        cs.room,
        TO_CHAR(cs.start_time, 'HH12:MI AM') as start_time,
        TO_CHAR(cs.end_time, 'HH12:MI AM') as end_time,
        fu.name as faculty_name
      FROM payments p
      JOIN students s ON p.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN fees f ON p.fee_id = f.fee_id
      LEFT JOIN enrollments e ON (f.student_id = e.student_id AND f.section_id = e.section_id)
      LEFT JOIN course_sections cs ON e.section_id = cs.section_id
      LEFT JOIN courses c ON cs.course_id = c.course_id
      LEFT JOIN faculty fa ON cs.faculty_id = fa.faculty_id
      LEFT JOIN users fu ON fa.user_id = fu.user_id
      ORDER BY p.payment_id, e.enrollment_date DESC
    ) sub
    ORDER BY payment_date DESC
  `);
  return res.rows;
};

export const updatePaymentStatus = async (paymentId, status, waiver_justification = null, transactionId = null) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update the payment status and transaction ID if provided
    let query = `UPDATE payments SET status = $1`;
    let params = [status];
    
    if (transactionId) {
      query += `, transaction_id = $2 WHERE payment_id = $3 RETURNING *`;
      params.push(transactionId, paymentId);
    } else {
      query += ` WHERE payment_id = $2 RETURNING *`;
      params.push(paymentId);
    }

    const paymentRes = await client.query(query, params);
    
    if (paymentRes.rowCount === 0) {
      throw new Error('Payment record not found');
    }
    
    const payment = paymentRes.rows[0];

    // 2. Sync with the associated fee record if it exists
    if (payment.fee_id) {
      const feeRes = await client.query(`SELECT * FROM fees WHERE fee_id = $1`, [payment.fee_id]);
      const fee = feeRes.rows[0];

      let feeStatus = null;
      if (status === 'accepted') feeStatus = 'paid';
      else if (status === 'waived') feeStatus = 'waived';
      
      if (feeStatus) {
        await client.query(
          `UPDATE fees SET status = $1, waiver_justification = $2 WHERE fee_id = $3`,
          [feeStatus, waiver_justification, payment.fee_id]
        );

        // 2a. If it's a course registration fee, update enrollment status
        if (fee && fee.fee_type === 'Course Registration') {
          let sectionId = fee.section_id;
          
          // Fallback to parsing notes if section_id is not in the column
          if (!sectionId && fee.notes) {
            const sectionIdMatch = fee.notes.match(/SectionID: ([a-f0-9-]{36})/i);
            if (sectionIdMatch) {
              sectionId = sectionIdMatch[1];
            }
          }

          if (sectionId) {
            let enrollmentStatus = null;
            if (status === 'accepted') enrollmentStatus = 'enrolled';
            else if (status === 'rejected') enrollmentStatus = 'rejected';

            if (enrollmentStatus) {
              await client.query(
                `UPDATE enrollments SET status = $1 WHERE student_id = $2 AND section_id = $3`,
                [enrollmentStatus, payment.student_id, sectionId]
              );
            }
          }
        }
      }
    }

    await client.query('COMMIT');

    // 3. Notify student asynchronously (outside transaction to avoid blocking)
    try {
      const studentUserRes = await db.query(
        "SELECT u.user_id FROM users u JOIN students s ON u.user_id = s.user_id WHERE s.student_id = $1",
        [payment.student_id]
      );
      
      if (studentUserRes.rowCount > 0) {
        await notify({
          userId: studentUserRes.rows[0].user_id,
          title: `Payment ${status.toUpperCase()}`,
          message: `Your payment of PKR ${parseFloat(payment.amount_paid).toLocaleString()} (Txn: ${payment.transaction_id || 'N/A'}) has been ${status}. ${waiver_justification ? `Reason: ${waiver_justification}` : ''}`,
          type: 'payment',
          priority: status === 'rejected' ? 'high' : 'medium',
          channels: ['in-app', 'email']
        });
      }
    } catch (notifyErr) {
      console.error('Notification failed during payment status update:', notifyErr);
      // We don't throw here as the transaction is already committed
    }
    
    return payment;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updatePaymentStatus Error:', err);
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────── SITE SETTINGS ───────────────────────

export const getSiteSettings = async () => {
  const res = await db.query('SELECT key, value FROM site_settings');
  return res.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

export const updateSiteSettings = async (settings) => {
  const queries = Object.entries(settings).map(([key, value]) => {
    return db.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, JSON.stringify(value)]);
  });
  
  await Promise.all(queries);
  return getSiteSettings();
};

// ─────────────────────── FEE STRUCTURES ───────────────────────

export const generateBulkFees = async (data) => {
  const { program, semester, course_id, section_id } = data;
  
  let structures = [];
  let students = [];

  if (course_id && section_id) {
    // 1. Get structures for this course/section
    const structuresRes = await db.query(
      'SELECT * FROM fee_structures WHERE course_id = $1 AND (section_id = $2 OR section_id IS NULL) AND is_active = true',
      [course_id, section_id]
    );
    structures = structuresRes.rows;

    if (structures.length === 0) {
      throw new Error(`No active fee configuration found for this course and section. Please add pricing in the Fee Matrix first.`);
    }

    // 2. Get students enrolled in this section
    const studentsRes = await db.query(
      `SELECT DISTINCT s.student_id FROM students s
       JOIN enrollments e ON s.student_id = e.student_id
       WHERE e.section_id = $1 AND e.status = 'enrolled' AND s.status = 'active'`,
      [section_id]
    );
    students = studentsRes.rows;
  } else {
    // Legacy program/semester based generation
    const structuresRes = await db.query(
      'SELECT * FROM fee_structures WHERE program = $1 AND semester = $2 AND is_active = true',
      [program, semester]
    );
    structures = structuresRes.rows;

    if (structures.length === 0) {
      throw new Error(`No active fee structure found for ${program} — ${semester}.`);
    }

    const studentsRes = await db.query(
      "SELECT student_id FROM students WHERE status = 'active' AND program = $1",
      [program]
    );
    students = studentsRes.rows;
  }

  if (students.length === 0) {
    throw new Error(`No active students found matching the criteria.`);
  }

  // 3. Insert fee records
  let generatedCount = 0;
  const insertPromises = [];
  
  for (const student of students) {
    for (const structure of structures) {
      // Use a more unique identifier for course-based fees if applicable
      const uniqueSemester = semester || `COURSE_${course_id.substring(0,8)}`;
      
      insertPromises.push(
        db.query(
          `INSERT INTO fees (student_id, amount, semester, fee_type, due_date, status, discount_amount, course_id, section_id)
           VALUES ($1, $2, $3, $4, CURRENT_DATE + INTERVAL '15 days', 'pending', 0, $5, $6)
           ON CONFLICT (student_id, semester, fee_type) DO NOTHING`,
          [student.student_id, structure.amount, uniqueSemester, structure.category, course_id || null, section_id || null]
        ).then(async r => {
          if (r.rowCount > 0) {
            generatedCount++;
            // Notify student
            const userRes = await db.query("SELECT user_id FROM students WHERE student_id = $1", [student.student_id]);
            if (userRes.rowCount > 0) {
              notify({
                userId: userRes.rows[0].user_id,
                title: 'Fee Payment Due',
                message: `An invoice for ${structure.category} (${structure.amount}) has been generated for ${uniqueSemester}. Due date: ${new Date(Date.now() + 15 * 86400000).toLocaleDateString()}`,
                type: 'payment',
                priority: 'high',
                channels: ['in-app', 'email']
              });
            }
          }
        }).catch(err => {
          console.error('Error generating fee for student:', student.student_id, err);
        })
      );
    }
  }

  await Promise.all(insertPromises);

  return {
    generatedCount,
    totalStudents: students.length,
    skipped: (students.length * structures.length) - generatedCount
  };
};

export const getFeeStructures = async () => {
  const res = await db.query(`
    SELECT fs.*, c.title as course_title, cs.section_name 
    FROM fee_structures fs
    LEFT JOIN courses c ON fs.course_id = c.course_id
    LEFT JOIN course_sections cs ON fs.section_id = cs.section_id
    ORDER BY fs.created_at DESC
  `);
  return res.rows;
};
export const createFeeStructure = async (data) => {
  const { program, semester, category, amount, course_id, section_id } = data;
  const res = await db.query(
    `INSERT INTO fee_structures (program, semester, category, amount, course_id, section_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [program || null, semester || null, category, amount, course_id || null, section_id || null]
  );
  
  // Fetch joined data for frontend immediate update
  const joinedRes = await db.query(`
    SELECT fs.*, c.title as course_title, cs.section_name 
    FROM fee_structures fs
    LEFT JOIN courses c ON fs.course_id = c.course_id
    LEFT JOIN course_sections cs ON fs.section_id = cs.section_id
    WHERE fs.structure_id = $1
  `, [res.rows[0].structure_id]);
  
  return joinedRes.rows[0];
};

export const deleteFeeStructure = async (id) => {
  await db.query('DELETE FROM fee_structures WHERE structure_id = $1', [id]);
};

export const updateFeeStructure = async (id, data) => {
  const { amount, category, course_id, section_id } = data;
  const res = await db.query(`
    UPDATE fee_structures
    SET amount = $1, category = $2, course_id = $3, section_id = $4
    WHERE structure_id = $5
    RETURNING *
  `, [amount, category, course_id, section_id, id]);
  
  if (res.rows.length === 0) throw new Error('Fee structure not found');
  
  // Fetch joined data for frontend immediate update
  const joinedRes = await db.query(`
    SELECT fs.*, c.title as course_title, cs.section_name 
    FROM fee_structures fs
    LEFT JOIN courses c ON fs.course_id = c.course_id
    LEFT JOIN course_sections cs ON fs.section_id = cs.section_id
    WHERE fs.structure_id = $1
  `, [id]);
  
  return joinedRes.rows[0];
};

// ─────────────────────── COURSE APPROVALS ───────────────────────
export const getApprovalRequests = async (status = 'pending') => {
  try {
    const res = await db.query(
      `SELECT r.*, 
              u.name as faculty_name, u.email as faculty_email,
              a.name as admin_name
       FROM approval_requests r
       JOIN users u ON r.requester_id = u.user_id
       LEFT JOIN users a ON r.admin_id = a.user_id
       WHERE r.status = $1
       ORDER BY r.created_at ASC`,
      [status]
    );
    return res.rows;
  } catch (err) {
    throw new Error('Failed to fetch approval requests: ' + err.message);
  }
};

export const getApprovalRequestById = async (requestId) => {
  try {
    const res = await db.query(
      `SELECT r.*, 
              u.name as faculty_name, u.email as faculty_email,
              a.name as admin_name
       FROM approval_requests r
       JOIN users u ON r.requester_id = u.user_id
       LEFT JOIN users a ON r.admin_id = a.user_id
       WHERE r.request_id = $1`,
      [requestId]
    );
    return res.rows[0];
  } catch (err) {
    throw new Error('Failed to fetch approval request: ' + err.message);
  }
};

export const getCourseById = async (courseId) => {
  try {
    const res = await db.query(`SELECT * FROM courses WHERE course_id = $1`, [courseId]);
    return res.rows[0];
  } catch (err) {
    throw new Error('Failed to fetch course: ' + err.message);
  }
};

export const updateApprovalRequest = async (requestId, { status, adminComment, adminId }) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Get the request
    const requestRes = await client.query(
      `SELECT * FROM approval_requests WHERE request_id = $1`, [requestId]
    );
    if (!requestRes.rows.length) throw new Error('Request not found');
    const request = requestRes.rows[0];

    // 2. Update status
    await client.query(
      `UPDATE approval_requests SET status = $1, admin_comment = $2, admin_id = $3, updated_at = NOW() WHERE request_id = $4`,
      [status, adminComment, adminId, requestId]
    );

    // 3. If approved, apply the change
    if (status === 'approved') {
      console.log(`Applying approved request ${request.request_id} of type ${request.request_type}`);
      let data = request.request_data || {};
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse request_data string:', data);
          data = {};
        }
      }
      console.log('Approval data payload:', JSON.stringify(data, null, 2));
    
      // Re-verify faculty schedule conflict before final approval
      if ((request.request_type === 'COURSE_ADD' || request.request_type === 'COURSE_EDIT') && data.day_of_week && data.start_time && data.end_time) {
        if (data.start_time >= data.end_time) {
          throw new Error('Cannot approve: Start time must be before end time.');
        }
        console.log('Re-verifying schedule for faculty user_id:', request.requester_id);
        const facultyRes = await client.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [request.requester_id]);
        const facultyId = facultyRes.rows[0]?.faculty_id;
        console.log('Found facultyId:', facultyId);

        if (facultyId) {
          const proposedDays = normalizeDays(data.day_of_week);
          const conflictRes = await client.query(`
            SELECT cs.section_name, c.title, cs.day_of_week
            FROM course_sections cs
            JOIN courses c ON cs.course_id = c.course_id
            WHERE cs.faculty_id = $1
            AND ($3::TEXT IS NULL OR cs.section_id::TEXT != $3::TEXT)
            AND (
              (cs.start_time::TIME, cs.end_time::TIME) OVERLAPS ($2::TIME, $4::TIME)
            )
          `, [facultyId, data.start_time, data.section_id || null, data.end_time]);

          // Filter by normalized days in JS for maximum reliability
          const conflict = conflictRes.rows.find(row => {
            const existingDays = normalizeDays(row.day_of_week);
            return existingDays.some(d => proposedDays.includes(d));
          });

          if (conflict) {
            throw new Error(`Cannot approve: Faculty has a schedule conflict with "${conflict.title} - ${conflict.section_name}" at this time on ${conflict.day_of_week}.`);
          }
        }
      }
      
      if (request.request_type === 'COURSE_ADD') {
        console.log('Inserting new course:', data.course_code);
        // Ensure required fields for NOT NULL constraints
        if (!data.course_code || !data.title || data.credit_hours === undefined) {
          throw new Error('Incomplete course data for insertion: missing course_code, title, or credit_hours');
        }

        let newCourseId;
        try {
          const courseRes = await client.query(
            `INSERT INTO courses (course_code, title, credit_hours, department, description, max_seats)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING course_id`,
            [
              data.course_code, 
              data.title, 
              parseInt(data.credit_hours), 
              data.department || null, 
              data.description || '', 
              parseInt(data.max_seats) || 50
            ]
          );
          newCourseId = courseRes.rows[0].course_id;
          console.log('New course created with ID:', newCourseId);
        } catch (dbErr) {
          console.error('Error during COURSE_ADD insert:', dbErr);
          throw new Error('Database error during course creation: ' + dbErr.message);
        }

        // Find faculty_id for the requester
        try {
          const facultyRes = await client.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [request.requester_id]);
          if (facultyRes.rows.length > 0) {
            const facultyId = facultyRes.rows[0].faculty_id;
            console.log('Creating initial section for faculty:', facultyId);
            await client.query(
              `INSERT INTO course_sections (course_id, faculty_id, section_name, day_of_week, start_time, end_time, room)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [newCourseId, facultyId, 'Section A', data.day_of_week || 'TBD', data.start_time || null, data.end_time || null, data.room || 'TBD']
            );
          }
        } catch (secErr) {
          console.error('Error during COURSE_ADD section insert:', secErr);
          throw new Error('Database error during section creation: ' + secErr.message);
        }
      } else if (request.request_type === 'COURSE_EDIT') {
        console.log('Updating course:', request.target_id);
        if (!request.target_id) throw new Error('Target course ID is missing for edit request');

        // Fetch current values to fill gaps if partial data is sent
        const currentCourse = await client.query(`SELECT * FROM courses WHERE course_id = $1`, [request.target_id]);
        if (!currentCourse.rows.length) throw new Error(`Target course ${request.target_id} not found`);
        const current = currentCourse.rows[0];

        // Merge current and new data
        const finalData = {
          course_code: data.course_code !== undefined ? data.course_code : current.course_code,
          title: data.title !== undefined ? data.title : current.title,
          credit_hours: data.credit_hours !== undefined ? data.credit_hours : current.credit_hours,
          department: data.department !== undefined ? data.department : current.department,
          description: data.description !== undefined ? data.description : current.description,
          max_seats: data.max_seats !== undefined ? data.max_seats : current.max_seats
        };

        try {
          const updateRes = await client.query(
            `UPDATE courses 
             SET course_code = $1, title = $2, credit_hours = $3, department = $4, description = $5, max_seats = $6
             WHERE course_id = $7`,
            [
              finalData.course_code, 
              finalData.title, 
              parseInt(finalData.credit_hours) || 0, 
              finalData.department, 
              finalData.description, 
              parseInt(finalData.max_seats) || 50, 
              request.target_id
            ]
          );
          console.log(`Update result: ${updateRes.rowCount} rows affected`);
        } catch (dbErr) {
          console.error('Error during COURSE_EDIT update:', dbErr);
          throw new Error('Database error during course update: ' + dbErr.message);
        }

        // If section_id is present, update the section details (time, room, capacity)
        if (data.section_id) {
          console.log('Updating section details:', data.section_id);
          await client.query(
            `UPDATE course_sections 
             SET day_of_week = COALESCE($1, day_of_week), 
                 start_time = COALESCE($2, start_time), 
                 end_time = COALESCE($3, end_time), 
                 room = COALESCE($4, room)
             WHERE section_id = $5`,
            [data.day_of_week, data.start_time, data.end_time, data.room, data.section_id]
          );
        }
      } else if (request.request_type === 'COURSE_DELETE') {
        console.log('Deleting course:', request.target_id);
        await client.query(`DELETE FROM courses WHERE course_id = $1`, [request.target_id]);
      }
    }

    // 4. Notify faculty
    await notify({
      userId: request.requester_id,
      title: `Course Request ${status.toUpperCase()}`,
      message: `Your request to ${request.request_type.replace('_', ' ')} has been ${status}. ${adminComment ? `Comment: ${adminComment}` : ''}`,
      type: 'system',
      priority: status === 'approved' ? 'medium' : 'high',
      channels: ['in-app', 'email']
    });

    await client.query('COMMIT');

    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getStudentFullDetails = async (studentId) => {
  try {
    // 1. Basic Student Info
    const userSql = `
      SELECT s.student_id, s.gpa, s.program, s.semester, s.contact_number, s.gender, s.date_of_birth, s.cnic, u.name as full_name, u.email, s.status as account_status, u.user_id
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.student_id = $1
    `;
    const userRes = await db.query(userSql, [studentId]);
    const student = userRes.rows[0];

    if (!student) throw new Error('Student profile not found');

    // 2. Enrolled Courses
    const enrolledSql = `
      SELECT 
        e.enrollment_id, e.status, e.grade, e.grade_points,
        c.title, c.course_code, c.credit_hours,
        cs.section_id, cs.section_name, cs.day_of_week, 
        TO_CHAR(cs.start_time, 'HH12:MI AM') as start_time, 
        TO_CHAR(cs.end_time, 'HH12:MI AM') as end_time, 
        cs.room,
        u.name as instructor_name
      FROM enrollments e
      JOIN course_sections cs ON e.section_id = cs.section_id
      JOIN courses c ON cs.course_id = c.course_id
      LEFT JOIN faculty f ON cs.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
      WHERE e.student_id = $1
      ORDER BY e.status, c.course_code
    `;
    const enrolledRes = await db.query(enrolledSql, [studentId]);

    // 3. Attendance Summary
    const attendanceSql = `
      SELECT 
        cs.section_id, c.course_code, c.title as course_title,
        COUNT(CASE WHEN att.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN att.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN att.status = 'late' THEN 1 END) as late_count,
        COUNT(att.attendance_id) as total_days
      FROM enrollments e
      JOIN course_sections cs ON e.section_id = cs.section_id
      JOIN courses c ON cs.course_id = c.course_id
      LEFT JOIN attendance att ON att.section_id = cs.section_id AND att.student_id = $1
      WHERE e.student_id = $1 AND e.status = 'enrolled'
      GROUP BY cs.section_id, c.course_code, c.title
    `;
    const attendanceRes = await db.query(attendanceSql, [studentId]);

    // 4. Assignments & Submissions
    const assignSql = `
      SELECT 
        a.assignment_id, a.title, a.deadline, a.max_marks,
        c.course_code,
        sub.submission_id, sub.submitted_at, sub.marks_obtained, sub.feedback, sub.file_url,
        CASE WHEN sub.submission_id IS NOT NULL THEN 'Submitted' ELSE 'Pending' END as status
      FROM assignments a
      JOIN course_sections cs ON a.section_id = cs.section_id
      JOIN enrollments e ON e.section_id = cs.section_id
      JOIN courses c ON cs.course_id = c.course_id
      LEFT JOIN submissions sub ON sub.assignment_id = a.assignment_id AND sub.student_id = $1
      WHERE e.student_id = $1
      ORDER BY a.deadline DESC
    `;
    const assignRes = await db.query(assignSql, [studentId]);

    // 5. Fee History
    const feeSql = `
      SELECT f.*, (f.amount - f.discount_amount) as net_amount,
             p.payment_id, p.payment_date, p.payment_method, p.status as payment_status
      FROM fees f 
      LEFT JOIN payments p ON p.fee_id = f.fee_id
      WHERE f.student_id = $1
      ORDER BY f.due_date DESC
    `;
    const feeRes = await db.query(feeSql, [studentId]);

    return {
      studentInfo: student,
      enrolled: enrolledRes.rows,
      attendance: attendanceRes.rows.map(a => ({
        ...a,
        percentage: a.total_days > 0 ? Math.round((a.present_count / a.total_days) * 100) : 0
      })),
      assignments: assignRes.rows,
      fees: feeRes.rows
    };
  } catch (err) {
    console.error('getStudentFullDetails error:', err);
    throw err;
  }
};


