import { query, pool } from '../config/db.js';
import { recalculateStudentGrades } from './student.service.js';

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
        s.section_id, s.section_name,
        c.max_seats,
        (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.section_id AND e.status = 'enrolled') as current_seats,
        s.day_of_week, s.start_time, s.end_time,
        c.course_id, c.course_code, c.title, c.credit_hours, c.department,
        u.name as faculty_name
      FROM course_sections s
      JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
      LEFT JOIN users u ON f.user_id = u.user_id
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

export const enrollStudent = async (studentId, sectionId, paymentMethod, receiptUrl, transactionId = null) => {
  console.log('>>> COURSE SERVICE ENROLL STUDENT HIT <<<', { studentId, sectionId, transactionId });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 0. Check for delinquent fees
    const feeSql = `SELECT count(*) FROM fees WHERE student_id = $1 AND status = 'pending' AND due_date < NOW()`;
    const feeRes = await client.query(feeSql, [studentId]);
    if (parseInt(feeRes.rows[0].count) > 0) {
      throw new Error('Course registration blocked: You have outstanding delinquent fees.');
    }

    // 1. Check seats and course details
    const checkSql = `
      SELECT cs.max_seats, 
      (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = cs.section_id AND e.status = 'enrolled') as current_seats, 
      c.title, c.course_code
      FROM course_sections cs
      JOIN courses c ON cs.course_id = c.course_id
      WHERE cs.section_id = $1
    `;
    const checkRes = await client.query(checkSql, [sectionId]);
    if (checkRes.rows.length === 0) throw new Error('Section not found');
    if (parseInt(checkRes.rows[0].current_seats) >= checkRes.rows[0].max_seats) {
      throw new Error('Section is full');
    }

    // 2. Check if already enrolled or pending (to give specific error messages)
    const existingSql = `SELECT status FROM enrollments WHERE student_id = $1 AND section_id = $2`;
    const existingRes = await client.query(existingSql, [studentId, sectionId]);
    if (existingRes.rows.length > 0) {
      const status = existingRes.rows[0].status;
      if (status === 'enrolled') throw new Error('You are already enrolled in this section');
      if (status === 'pending') throw new Error('Your enrollment request for this section is already pending verification');
    }

    // 3. Create or Update enrollment (status='pending') using atomic ON CONFLICT
    const enrolSql = `
      INSERT INTO enrollments (student_id, section_id, status, enrollment_date)
      VALUES ($1, $2, 'pending', NOW())
      ON CONFLICT (student_id, section_id) 
      DO UPDATE SET 
        status = 'pending', 
        enrollment_date = NOW()
      RETURNING *
    `;
    const enrolRes = await client.query(enrolSql, [studentId, sectionId]);
    const enrollment = enrolRes.rows[0];

    // 4. Calculate total fee from fee_structures (Fee Matrix)
    const feeStructureRes = await client.query(`
      SELECT SUM(amount) as total_amount 
      FROM fee_structures 
      WHERE (section_id = $1 OR (course_id = (SELECT course_id FROM course_sections WHERE section_id = $1) AND section_id IS NULL))
      AND is_active = true
    `, [sectionId]);

    const amount = parseFloat(feeStructureRes.rows[0].total_amount || 0);

    // Always create a fee + payment record to capture the receipt
    // (even if amount is 0 / no fee structure configured)
    {
      let feeId;

      // Check if a fee already exists for this enrollment
      const existingFeeRes = await client.query(
        `SELECT fee_id FROM fees WHERE student_id = $1 AND section_id = $2 AND fee_type = 'Course Registration' LIMIT 1`,
        [studentId, sectionId]
      );

      if (existingFeeRes.rows.length > 0) {
        feeId = existingFeeRes.rows[0].fee_id;
        await client.query(
          `UPDATE fees SET status = 'pending', amount = $1, due_date = NOW() WHERE fee_id = $2`,
          [amount, feeId]
        );
      } else {
        const feeInsertSql = `
          INSERT INTO fees (student_id, semester, fee_type, amount, status, due_date, notes, section_id)
          VALUES ($1, 'Current', 'Course Registration', $2, 'pending', NOW(), $3, $4)
          RETURNING fee_id
        `;
        const feeRes2 = await client.query(feeInsertSql, [
          studentId, amount,
          `Enrollment for ${checkRes.rows[0].course_code} | SectionID: ${sectionId}`,
          sectionId
        ]);
        feeId = feeRes2.rows[0].fee_id;
      }

      // 3. Ensure a payment record exists for this fee to hold the receipt
      const existingPaymentRes = await client.query(
        `SELECT payment_id FROM payments WHERE fee_id = $1 AND student_id = $2 LIMIT 1`,
        [feeId, studentId]
      );

      if (existingPaymentRes.rows.length > 0) {
        await client.query(
          `UPDATE payments 
           SET amount_paid = $1, transaction_id = $2, payment_method = $3, receipt_url = $4, status = 'pending', payment_date = NOW()
           WHERE payment_id = $5`,
          [amount, transactionId || null, paymentMethod || 'Other', receiptUrl || null, existingPaymentRes.rows[0].payment_id]
        );
      } else {
        await client.query(`
          INSERT INTO payments (student_id, fee_id, amount_paid, payment_method, receipt_url, status, transaction_id)
          VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        `, [studentId, feeId, amount, paymentMethod, receiptUrl, transactionId]);
      }
    }

    await client.query('COMMIT');
    return enrollment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const dropStudent = async (studentId, sectionId) => {
  try {
    const checkSql = 'SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND section_id = $2 AND status IN (\'enrolled\', \'pending\')';
    const checkRes = await query(checkSql, [studentId, sectionId]);
    if (checkRes.rows.length === 0) throw new Error('Enrollment record not found or already processed');

    const updateSql = `
      UPDATE enrollments 
      SET status = 'dropped' 
      WHERE student_id = $1 AND section_id = $2
      RETURNING *
    `;
    const { rows } = await query(updateSql, [studentId, sectionId]);

    // Seat count is handled dynamically by subqueries in the dashboard/available courses list.
    // No physical current_seats column exists in the database.

    const enrollment = rows[0];
    if (enrollment) {
      await recalculateStudentGrades(studentId);
    }
    return enrollment;
  } catch (err) {
    console.error('Drop error:', err);
    throw err;
  }
};

export const swapStudent = async (studentId, oldSectionId, newSectionId) => {
  // Use a transaction for atomicity
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check for delinquent fees
    const feeSql = `SELECT count(*) FROM fees WHERE student_id = $1 AND status = 'pending' AND due_date < NOW()`;
    const feeRes = await client.query(feeSql, [studentId]);
    if (parseInt(feeRes.rows[0].count) > 0) {
      throw new Error('Course swap blocked: You have outstanding delinquent fees.');
    }

    // 2. Verify old enrollment exists
    const checkOldSql = 'SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND section_id = $2 AND status = \'enrolled\'';
    const checkOldRes = await client.query(checkOldSql, [studentId, oldSectionId]);
    if (checkOldRes.rows.length === 0) throw new Error('Existing enrollment record not found');

    // 3. Check seats for new section
    const checkNewSql = `
      SELECT 
        c.max_seats, 
        (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = s.section_id AND e.status = 'enrolled') as current_seats
      FROM course_sections s
      JOIN courses c ON s.course_id = c.course_id
      WHERE s.section_id = $1
    `;
    const checkNewRes = await client.query(checkNewSql, [newSectionId]);
    if (checkNewRes.rows.length === 0) throw new Error('New section not found');
    if (parseInt(checkNewRes.rows[0].current_seats) >= parseInt(checkNewRes.rows[0].max_seats)) {
      throw new Error('Target section is full');
    }

    // 4. Drop old
    await client.query(`UPDATE enrollments SET status = 'dropped' WHERE student_id = $1 AND section_id = $2`, [studentId, oldSectionId]);

    // 5. Enroll new (Using UPSERT to handle previously dropped records)
    await client.query(`
      INSERT INTO enrollments (student_id, section_id, status, enrollment_date) 
      VALUES ($1, $2, 'enrolled', NOW())
      ON CONFLICT (student_id, section_id) 
      DO UPDATE SET status = 'enrolled', enrollment_date = NOW()
    `, [studentId, newSectionId]);

    await client.query('COMMIT');
    await recalculateStudentGrades(studentId);
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

