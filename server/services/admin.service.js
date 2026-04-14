import * as db from '../config/db.js';

// ─────────────────────── DASHBOARD OVERVIEW ───────────────────────

export const getDashboardStats = async () => {
  try {
    const [usersRes, studentsRes, facultyRes, coursesRes, enrollmentsRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'faculty'`),
      db.query(`SELECT COUNT(*) FROM courses WHERE is_active = true`),
      db.query(`SELECT COUNT(*) FROM enrollments WHERE status = 'enrolled'`),
    ]);
    return {
      totalUsers: parseInt(usersRes.rows[0].count),
      totalStudents: parseInt(studentsRes.rows[0].count),
      totalFaculty: parseInt(facultyRes.rows[0].count),
      activeCourses: parseInt(coursesRes.rows[0].count),
      activeEnrollments: parseInt(enrollmentsRes.rows[0].count),
    };
  } catch {
    // Mock data when DB is unavailable
    return {
      totalUsers: 142,
      totalStudents: 120,
      totalFaculty: 18,
      activeCourses: 34,
      activeEnrollments: 287,
    };
  }
};

// ─────────────────────── USER MANAGEMENT ───────────────────────

export const getAllUsers = async ({ role, page = 1, limit = 15 }) => {
  try {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [limit, offset];

    if (role && role !== 'all') {
      whereClause = 'WHERE role = $3';
      params.push(role);
    }

    const res = await db.query(
      `SELECT user_id, name, email, role, is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countRes = await db.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      role && role !== 'all' ? [role] : []
    );

    return {
      users: res.rows,
      total: parseInt(countRes.rows[0].count),
      page,
      limit,
    };
  } catch {
    return {
      users: [
        { user_id: '1', name: 'Alice Smith', email: 'alice@uni.edu', role: 'student', is_active: true, created_at: new Date() },
        { user_id: '2', name: 'Dr. Robert Hayes', email: 'robert@uni.edu', role: 'faculty', is_active: true, created_at: new Date() },
        { user_id: '3', name: 'Bob Johnson', email: 'bob@uni.edu', role: 'student', is_active: false, created_at: new Date() },
      ],
      total: 3, page, limit,
    };
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

// ─────────────────────── COURSE MANAGEMENT ───────────────────────

export const getAllCourses = async () => {
  try {
    const res = await db.query(
      `SELECT c.course_id, c.course_code, c.title, c.credit_hours, c.department, c.is_active,
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

export const createCourse = async ({ course_code, title, credit_hours, department, description }) => {
  try {
    const res = await db.query(
      `INSERT INTO courses (course_code, title, credit_hours, department, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course_code, title, credit_hours, department, description]
    );
    return res.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

// ─────────────────────── ANNOUNCEMENTS ───────────────────────

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

export const createAnnouncement = async ({ title, body, category, target_role, expiry_date, is_pinned, adminId }) => {
  try {
    const res = await db.query(
      `INSERT INTO announcements (title, body, category, target_role, expiry_date, is_pinned, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, body, category, target_role, expiry_date, is_pinned, adminId]
    );
    return res.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
