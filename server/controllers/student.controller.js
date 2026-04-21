import * as courseService from '../services/course.service.js';
import * as studentService from '../services/student.service.js';
import { logAction, createNotification } from '../services/admin.service.js';
import * as db from '../config/db.js';

/**
 * Fetch the metrics for the student dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const data = await studentService.getStudentDashboard(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Student Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching student dashboard' });
  }
};

/**
 * Fetch announcements for students
 */
export const getAnnouncements = async (req, res) => {
  try {
    const data = await studentService.getStudentAnnouncements(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Student Announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};

/**
 * Get catalog of available course sections
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const rows = await studentService.getAvailableSections();
    res.status(200).json(rows);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

/**
 * Enroll a student into a section
 */
export const enrollModule = async (req, res) => {
  try {
    const { sectionId } = req.body;
    
    // Get actual student_id from logged in user
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    const result = await courseService.enrollStudent(studentId, sectionId);
    
    await logAction({
      userId: req.user.id,
      action: 'COURSE_ENROLL',
      target: sectionId,
      details: `Enrolled in section ID: ${sectionId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ message: 'Successfully enrolled!', enrollment: result });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(400).json({ message: err.message || 'Enrollment failed' });
  }
};

/**
 * Drop or Withdraw from a section
 */
export const dropModule = async (req, res) => {
  try {
    const { sectionId } = req.body;
    
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    const result = await courseService.dropStudent(studentId, sectionId);
    
    await logAction({
      userId: req.user.id,
      action: 'COURSE_DROP',
      target: sectionId,
      details: `Dropped/Withdrew from section ID: ${sectionId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ message: 'Successfully dropped module', enrollment: result });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Drop failed' });
  }
};

/**
 * Swap an enrolled section for a new one (Transactional)
 */
export const swapModule = async (req, res) => {
  try {
    const { oldSectionId, newSectionId } = req.body;
    
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    const result = await courseService.swapStudent(studentId, oldSectionId, newSectionId);
    
    await logAction({
      userId: req.user.id,
      action: 'COURSE_SWAP',
      target: newSectionId,
      details: `Swapped section ${oldSectionId} for ${newSectionId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ message: 'Successfully swapped courses!', result });
  } catch (err) {
    console.error('Swap error:', err);
    res.status(400).json({ message: err.message || 'Swap failed' });
  }
};

export const submitPayment = async (req, res) => {
  try {
    const { fee_id, amount, transaction_id, payment_method, receipt_url } = req.body;
    
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    const studentId = studentRes.rows[0].student_id;

    const paymentRes = await db.query(`
      INSERT INTO payments (student_id, fee_id, amount_paid, transaction_id, payment_method, receipt_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [studentId, fee_id, amount, transaction_id, payment_method, receipt_url]);

    const payment = paymentRes.rows[0];

    await logAction({
      userId: req.user.id,
      action: 'PAYMENT_SUBMIT',
      target: payment.payment_id,
      details: `Submitted payment slip for ${amount} (Txn: ${transaction_id})`,
      ipAddress: req.ip
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Submit an assignment
 */
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = req.file.location || `/uploads/assignments/${req.file.filename}`;
    
    // Get student_id from user_id
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    // Fetch assignment deadline to check if late
    const assignmentRes = await db.query('SELECT deadline FROM assignments WHERE assignment_id = $1', [assignmentId]);
    if (assignmentRes.rows.length === 0) throw new Error('Assignment not found');
    const deadline = new Date(assignmentRes.rows[0].deadline);
    const isLate = new Date() > deadline;

    // Check if a submission already exists for this assignment and student
    const existingSubmission = await db.query(
      'SELECT submission_id FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, studentId]
    );

    let result;
    if (existingSubmission.rows.length > 0) {
      // Update existing submission
      result = await db.query(`
        UPDATE submissions 
        SET file_url = $1, submitted_at = NOW(), is_late = $2 
        WHERE submission_id = $3
        RETURNING *
      `, [fileUrl, isLate, existingSubmission.rows[0].submission_id]);
    } else {
      // Insert new submission
      result = await db.query(`
        INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at, is_late)
        VALUES ($1, $2, $3, NOW(), $4)
        RETURNING *
      `, [assignmentId, studentId, fileUrl, isLate]);
    }


    await logAction({
      userId: req.user.id,
      action: 'ASSIGNMENT_SUBMIT',
      target: assignmentId,
      details: `Submitted assignment ID: ${assignmentId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ 
      message: 'Assignment submitted successfully!', 
      submission: result.rows[0] 
    });
  } catch (err) {
    console.error('Assignment submission error:', err);
    res.status(500).json({ message: err.message || 'Submission failed' });
  }
};

