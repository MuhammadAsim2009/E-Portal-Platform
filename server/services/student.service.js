import { query } from '../config/db.js';

export const getStudentDashboard = async (userId) => {
  try {
    // Look up student_id from user_id, joining with users table to get the name
    const userSql = `
      SELECT s.student_id, s.gpa, s.program, s.semester, s.contact_number, u.name as full_name
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.user_id = $1
    `;
    const userRes = await query(userSql, [userId]);
    const student = userRes.rows[0];

    if (!student) throw new Error('Student profile not found');
    const studentId = student.student_id;

    // 1. Enrolled Courses (with section details)
    const enrolledSql = `
      SELECT 
        e.enrollment_id, e.status, c.title, c.course_code, c.credit_hours,
        s.section_id, s.section_name, s.day_of_week, s.start_time, s.end_time, s.room,
        f.department, u.name as instructor_name
      FROM enrollments e
      JOIN course_sections s ON e.section_id = s.section_id
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
      WHERE e.student_id = $1 AND e.status = 'enrolled'

    `;
    const enrolledRes = await query(enrolledSql, [studentId]);

    // 2. Upcoming & Past Assignments with Submissions
    const assignSql = `
      SELECT 
        a.assignment_id, a.title, a.deadline, a.max_marks,
        c.course_code,
        sub.submission_id, sub.submitted_at, sub.marks_obtained, sub.feedback, sub.file_url,
        CASE WHEN sub.submission_id IS NOT NULL THEN 'Submitted' ELSE 'Pending' END as status
      FROM assignments a
      JOIN course_sections s ON a.section_id = s.section_id
      JOIN enrollments e ON e.section_id = s.section_id
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN submissions sub ON sub.assignment_id = a.assignment_id AND sub.student_id = $1
      WHERE e.student_id = $1
      ORDER BY a.deadline ASC
    `;
    const assignRes = await query(assignSql, [studentId]);

    // 3. Attendance Summary (per section)
    const attendanceSql = `
      SELECT 
        s.section_id, c.course_code,
        COUNT(CASE WHEN att.status = 'present' THEN 1 END) as present_count,
        COUNT(att.attendance_id) as total_days
      FROM enrollments e
      JOIN course_sections s ON e.section_id = s.section_id
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN attendance att ON att.section_id = s.section_id AND att.student_id = $1
      WHERE e.student_id = $1 AND e.status = 'enrolled'
      GROUP BY s.section_id, c.course_code
    `;
    const attendanceRes = await query(attendanceSql, [studentId]);

    // 4. Fee Details & Unpaid Amount
    const feeSql = `
      SELECT *, (amount - discount_amount) as net_amount
      FROM fees WHERE student_id = $1
      ORDER BY due_date DESC
    `;
    const feeRes = await query(feeSql, [studentId]);
    const unpaidFees = feeRes.rows
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + parseFloat(f.net_amount), 0);

    // 5. GPA Trends (Mocked based on history for now, unless we have a grades table)
    // We can pull from past semesters in high fidelity
    const trendData = [
      { name: 'Sem 1', gpa: 3.4 },
      { name: 'Sem 2', gpa: 3.6 },
      { name: 'Sem 3', gpa: 3.2 },
      { name: 'Sem 4', gpa: 3.8 },
      { name: 'Sem 5', gpa: student.gpa || 3.7 },
    ];

    return {
      studentInfo: student,
      enrolled: enrolledRes.rows,
      assignments: assignRes.rows,
      attendance: attendanceRes.rows.map(a => ({
        course: a.course_code,
        percentage: a.total_days > 0 ? Math.round((a.present_count / a.total_days) * 100) : 100, // Default to 100 if no records
        total_days: a.total_days,
        present_count: a.present_count
      })),
      fees: feeRes.rows,
      unpaidFees,
      trendData
    };
  } catch (err) {
    console.error('getStudentDashboard error:', err);
    throw err;
  }
};

export const getAvailableSections = async () => {
  const sql = `
    SELECT 
      s.section_id, s.section_name, s.day_of_week, s.start_time, s.end_time, s.room,
      c.title, c.course_code, c.credit_hours, c.department, c.semester_offered,
      u.name as instructor_name
    FROM course_sections s
    JOIN courses c ON s.course_id = c.course_id
    LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
    LEFT JOIN users u ON f.user_id = u.user_id
    WHERE c.is_active = true

  `;
  const res = await query(sql);
  return res.rows;
};

export const getStudentAnnouncements = async (userId) => {
  const sql = `
    SELECT * FROM announcements
    WHERE 
      (target_role = 'student' OR target_role = 'all')
      OR (target_role = 'individual' AND target_user_id = $1)
    ORDER BY is_pinned DESC, created_at DESC
    LIMIT 50
  `;
  const res = await query(sql, [userId]);
  return res.rows;
};

export const getStudentGrades = async (userId) => {
  const userRes = await query('SELECT student_id FROM students WHERE user_id = $1', [userId]);
  if (userRes.rows.length === 0) throw new Error('Student profile not found');
  const studentId = userRes.rows[0].student_id;

  const sql = `
    SELECT 
      e.enrollment_id, e.grade as final_grade,
      c.course_code, c.title as course_title,
      ac.component_id, ac.name as component_name, ac.weightage, ac.max_marks,
      sm.marks_obtained
    FROM enrollments e
    JOIN course_sections cs ON e.section_id = cs.section_id
    JOIN courses c ON cs.course_id = c.course_id
    JOIN assessment_components ac ON ac.section_id = cs.section_id
    LEFT JOIN student_marks sm ON sm.component_id = ac.component_id AND sm.enrollment_id = e.enrollment_id
    WHERE e.student_id = $1 AND e.status = 'enrolled'
    ORDER BY c.course_code, ac.component_id
  `;
  const res = await query(sql, [studentId]);
  return res.rows;
};
