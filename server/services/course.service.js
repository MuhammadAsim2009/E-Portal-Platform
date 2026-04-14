import { query } from '../config/db.js';

// Fallbacks for mock data when Postgres is offline
const mockCourses = [
  { course_id: 'c1', course_code: 'CS101', title: 'Introduction to Comp Sci', credit_hours: 3, department: 'CS' },
  { course_id: 'c2', course_code: 'CS201', title: 'Data Structures', credit_hours: 4, department: 'CS' }
];

const mockSections = [
  { section_id: 'sec1', course_id: 'c1', section_name: 'A', max_seats: 40, current_seats: 10, schedule_time: 'Mon/Wed 10AM' },
  { section_id: 'sec2', course_id: 'c2', section_name: 'B', max_seats: 40, current_seats: 40, schedule_time: 'Tue/Thu 2PM' }
];

const mockEnrollments = [];

export const getAvailableSections = async () => {
  try {
    const sql = `
      SELECT 
        s.section_id, s.section_name, s.max_seats, s.current_seats, s.schedule_time,
        c.course_id, c.course_code, c.title, c.credit_hours, c.department,
        f.full_name as faculty_name
      FROM course_sections s
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
      WHERE c.is_active = true
    `;
    const { rows } = await query(sql);
    return rows;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return mockSections.map(sec => {
        const c = mockCourses.find(c => c.course_id === sec.course_id);
        return { ...sec, ...c, faculty_name: 'Dr. Smith' };
      });
    }
    throw err;
  }
};

export const enrollStudent = async (studentId, sectionId) => {
  try {
    // 1. Begin transaction / Check seats
    const checkSql = 'SELECT max_seats, current_seats FROM course_sections WHERE section_id = $1';
    const checkRes = await query(checkSql, [sectionId]);
    if (checkRes.rows.length === 0) throw new Error('Section not found');
    
    if (checkRes.rows[0].current_seats >= checkRes.rows[0].max_seats) {
      throw new Error('Section is full');
    }

    // 2. Insert enrollment
    const insertSql = `
      INSERT INTO enrollments (student_id, section_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await query(insertSql, [studentId, sectionId]);

    // 3. Increment seats
    await query('UPDATE course_sections SET current_seats = current_seats + 1 WHERE section_id = $1', [sectionId]);

    return rows[0];
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const sec = mockSections.find(s => s.section_id === sectionId);
      if (!sec) throw new Error('Section not found');
      if (sec.current_seats >= sec.max_seats) throw new Error('Section is full');
      
      const enr = { student_id: studentId, section_id: sectionId, status: 'enrolled' };
      mockEnrollments.push(enr);
      sec.current_seats++;
      return enr;
    }
    throw err;
  }
};
