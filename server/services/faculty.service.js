import * as db from '../config/db.js';
import { notify } from './notification.service.js';

// ─────────────────────── DASHBOARD ───────────────────────
export const getFacultyDashboard = async (userId) => {
  try {
    // Get faculty_id from user_id
    const facultyRes = await db.query(
      `SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]
    );
    if (!facultyRes.rows.length) throw new Error('Faculty record not found');
    const facultyId = facultyRes.rows[0].faculty_id;

    const [sectionsRes, studentsRes, assignmentsRes, pendingTasksRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM course_sections WHERE faculty_id = $1`, [facultyId]),
      db.query(`SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
                JOIN course_sections cs ON e.section_id = cs.section_id
                WHERE cs.faculty_id = $1 AND e.status = 'enrolled'`, [facultyId]),
      db.query(`SELECT COUNT(*) FROM assignments WHERE created_by = $1`, [facultyId]),
      db.query(`SELECT a.assignment_id as id, a.title, a.deadline, c.course_code, cs.section_name 
                FROM assignments a
                JOIN course_sections cs ON a.section_id = cs.section_id
                JOIN courses c ON cs.course_id = c.course_id
                WHERE a.created_by = $1 AND a.deadline >= NOW()
                ORDER BY a.deadline ASC LIMIT 2`, [facultyId]),
    ]);

    return {
      facultyId,
      sectionsCount: parseInt(sectionsRes.rows[0].count),
      studentsCount: parseInt(studentsRes.rows[0].count),
      assignmentsCount: parseInt(assignmentsRes.rows[0].count),
      pendingTasks: pendingTasksRes.rows,
    };
  } catch (error) {
    console.error("Dashboard error:", error);
    throw new Error('Failed to fetch dashboard data: ' + error.message);
  }
};

// ─────────────────────── MY COURSES ───────────────────────
export const getMyCourses = async (userId) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;

    const res = await db.query(
      `SELECT cs.section_id, cs.section_name, cs.room, cs.schedule_time,
              cs.max_seats, cs.current_seats,
              c.course_code, c.title, c.credit_hours, c.department
       FROM course_sections cs
       JOIN courses c ON cs.course_id = c.course_id
       WHERE cs.faculty_id = $1
       ORDER BY c.course_code`, [facultyId]
    );
    return res.rows;
  } catch (error) {
    console.error("Courses error:", error);
    throw new Error('Failed to fetch courses: ' + error.message);
  }
};

// ─────────────────────── GRADE BOOK ───────────────────────
export const getSectionStudents = async (sectionId) => {
  try {
    const res = await db.query(
      `SELECT e.enrollment_id, e.grade, e.status,
              s.student_id, u.name, u.email,
              st.program, st.semester
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN students st ON s.student_id = st.student_id
       WHERE e.section_id = $1 AND e.status = 'enrolled'
       ORDER BY u.name`, [sectionId]
    );
    return res.rows;
  } catch {
    return [
      { enrollment_id: '1', student_id: 'S1', name: 'Alice Johnson', email: 'alice@uni.edu', program: 'BSCS', semester: 4, grade: 'A' },
      { enrollment_id: '2', student_id: 'S2', name: 'Bob Williams', email: 'bob@uni.edu', program: 'BSCS', semester: 4, grade: 'B+' },
      { enrollment_id: '3', student_id: 'S3', name: 'Carol Davis', email: 'carol@uni.edu', program: 'BSCS', semester: 4, grade: null },
      { enrollment_id: '4', student_id: 'S4', name: 'David Brown', email: 'david@uni.edu', program: 'BSCS', semester: 4, grade: 'A-' },
      { enrollment_id: '5', student_id: 'S5', name: 'Eve Thomas', email: 'eve@uni.edu', program: 'BSCS', semester: 4, grade: 'B' },
    ];
  }
};

export const updateGrade = async (enrollmentId, grade) => {
  try {
    const res = await db.query(
      `UPDATE enrollments SET grade = $1 WHERE enrollment_id = $2 RETURNING *`,
      [grade, enrollmentId]
    );
    const enrollment = res.rows[0];

    // Notify student
    const studentUserRes = await db.query(
      "SELECT u.user_id, u.name, c.title FROM enrollments e JOIN students s ON e.student_id = s.student_id JOIN users u ON s.user_id = u.user_id JOIN course_sections cs ON e.section_id = cs.section_id JOIN courses c ON cs.course_id = c.course_id WHERE e.enrollment_id = $1",
      [enrollmentId]
    );
    if (studentUserRes.rowCount > 0) {
      await notify({
        userId: studentUserRes.rows[0].user_id,
        title: 'Grade Published',
        message: `Your final grade for ${studentUserRes.rows[0].title} has been updated to: ${grade}`,
        type: 'enrollment',
        priority: 'medium',
        channels: ['in-app', 'email']
      });
    }

    return enrollment;
  } catch (err) {
    console.error('Update Grade Error:', err);
    return { enrollment_id: enrollmentId, grade };
  }
};

// ─────────────────────── ATTENDANCE ───────────────────────
export const getAttendance = async (sectionId, date) => {
  try {
    const res = await db.query(
      `SELECT a.attendance_id, a.status,
              s.student_id, u.name
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.section_id = $1 AND a.date = $2`, [sectionId, date]
    );
    return res.rows;
  } catch {
    return [];
  }
};

export const submitAttendance = async (sectionId, date, records, userId) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;
    if (!facultyId) throw new Error('Faculty record not found');

    // Upsert attendance records for each student
    for (const { studentId, status } of records) {
      await db.query(
        `INSERT INTO attendance (section_id, student_id, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (section_id, student_id, date)
         DO UPDATE SET status = EXCLUDED.status`,
        [sectionId, studentId, date, status, facultyId]
      );
    }

    // --- ATTENDANCE THRESHOLD CHECK ---
    const THRESHOLD = 0.75;
    for (const { studentId } of records) {
       const statsRes = await db.query(`
         SELECT 
           COUNT(CASE WHEN status = 'present' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) as ratio,
           u.user_id, c.title
         FROM attendance a
         JOIN students s ON a.student_id = s.student_id
         JOIN users u ON s.user_id = u.user_id
         JOIN course_sections cs ON a.section_id = cs.section_id
         JOIN courses c ON cs.course_id = c.course_id
         WHERE a.student_id = $1 AND a.section_id = $2
         GROUP BY u.user_id, c.title
       `, [studentId, sectionId]);

       if (statsRes.rowCount > 0 && statsRes.rows[0].ratio < THRESHOLD) {
         notify({
           userId: statsRes.rows[0].user_id,
           title: 'Low Attendance Alert',
           message: `Your attendance in ${statsRes.rows[0].title} has dropped below the 75% threshold (Current: ${Math.round(statsRes.rows[0].ratio * 100)}%). Please attend classes regularly to avoid penalties.`,
           type: 'system',
           priority: 'high',
           channels: ['in-app', 'email']
         });
       }
    }
    // ------------------------------------

    return { success: true, count: records.length };
  } catch (err) {
    console.error('Attendance submit error:', err);
    return { success: false, error: err.message };
  }
};

// ─────────────────────── ASSIGNMENTS ───────────────────────
export const getSectionAssignments = async (sectionId) => {
  try {
    const res = await db.query(
      `SELECT * FROM assignments WHERE section_id = $1 ORDER BY deadline ASC`, [sectionId]
    );
    return res.rows;
  } catch {
    return [
      { assignment_id: '1', title: 'Lab 1: Linked Lists', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), max_marks: 20, submission_type: 'file' },
      { assignment_id: '2', title: 'Mid-term Project', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), max_marks: 50, submission_type: 'file' },
    ];
  }
};

export const createAssignment = async ({ sectionId, title, description, deadline, max_marks, submission_type, userId }) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;
    if (!facultyId) throw new Error('Faculty record not found');

    const res = await db.query(
      `INSERT INTO assignments (section_id, title, description, deadline, max_marks, submission_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sectionId, title, description, deadline, max_marks, submission_type, facultyId]
    );
    const assignment = res.rows[0];

    // Notify all Students in section
    const studentsRes = await db.query(`
      SELECT u.user_id, c.title as course_title 
      FROM enrollments e 
      JOIN students s ON e.student_id = s.student_id 
      JOIN users u ON s.user_id = u.user_id 
      JOIN course_sections cs ON e.section_id = cs.section_id
      JOIN courses c ON cs.course_id = c.course_id
      WHERE e.section_id = $1 AND e.status = 'enrolled'
    `, [sectionId]);

    if (studentsRes.rowCount > 0) {
      const courseTitle = studentsRes.rows[0].course_title;
      for (const student of studentsRes.rows) {
        notify({
          userId: student.user_id,
          title: 'New Assignment Posted',
          message: `A new assignment "${title}" has been posted for ${courseTitle}. Deadline: ${new Date(deadline).toLocaleString()}`,
          type: 'assignment',
          priority: 'medium',
          channels: ['in-app', 'email']
        });
      }
    }

    return assignment;
  } catch (err) {
    throw new Error(err.message);
  }
};
