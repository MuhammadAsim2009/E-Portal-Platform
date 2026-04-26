import * as courseService from '../services/course.service.js';
import * as studentService from '../services/student.service.js';
import { logAction, createNotification } from '../services/admin.service.js';
import { notify } from '../services/notification.service.js';
import * as db from '../config/db.js';
import { getSignedFileUrl } from '../services/s3Service.js';
import * as adminService from '../services/admin.service.js';

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
 * Get site settings relevant for students (e.g. payment details)
 */
export const getSiteSettings = async (req, res) => {
  try {
    const settings = await adminService.getSiteSettings();
    // Filter out any sensitive settings if necessary
    // For now, only provide what's needed for payment
    res.status(200).json(settings);
  } catch (err) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ message: 'Error fetching site settings' });
  }
};

/**
 * Update student profile data (excluding email and GPA)
 */
export const updateSettings = async (req, res) => {
  try {
    const { contact_number, gender, date_of_birth, cnic } = req.body;
    
    // Get actual student_id from logged in user
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    await db.query(
      `UPDATE students 
       SET contact_number = COALESCE($1, contact_number),
           gender = COALESCE($2, gender),
           date_of_birth = COALESCE($3, date_of_birth),
           cnic = COALESCE($4, cnic)
       WHERE student_id = $5`,
      [contact_number, gender, date_of_birth, cnic, studentId]
    );

    await logAction({
      userId: req.user.id,
      action: 'PROFILE_UPDATE',
      target: studentId,
      details: 'Student updated their profile settings.',
      ipAddress: req.ip
    });

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ message: err.message || 'Error updating settings' });
  }
};

/**
 * Enroll a student into a section
 */
export const enrollModule = async (req, res) => {
  console.log('>>> ENROLL MODULE CONTROLLER HIT <<<');
  try {
    const { sectionId, paymentMethod, transactionId } = req.body;
    const receiptFile = req.file;

    if (!sectionId || !paymentMethod || !receiptFile) {
      return res.status(400).json({ message: 'Missing required fields: sectionId, paymentMethod, or receipt' });
    }

    const receiptUrl = receiptFile.location || `/uploads/receipts/${receiptFile.filename}`;
    
    // Get actual student_id from logged in user
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    // Call service with extended parameters
    const result = await courseService.enrollStudent(studentId, sectionId, paymentMethod, receiptUrl, transactionId);
    
    await logAction({
      userId: req.user.id,
      action: 'COURSE_ENROLL_REQUEST',
      target: sectionId,
      details: `Requested enrollment in section ID: ${sectionId} with payment ${paymentMethod}`,
      ipAddress: req.ip
    });

    res.status(200).json({ 
      message: 'Enrollment request submitted! Admin will verify your payment receipt soon.', 
      enrollment: result 
    });
  } catch (err) {
    console.error('CRITICAL ENROLLMENT ERROR:', {
      message: err.message,
      detail: err.detail,
      constraint: err.constraint,
      table: err.table,
      stack: err.stack
    });
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
    const { fee_id, amount, transaction_id, payment_method } = req.body;
    
    // For S3 uploads using multer-s3, the URL is available at req.file.location
    const receipt_url = req.file ? req.file.location : null;

    if (!receipt_url) {
      return res.status(400).json({ message: 'Receipt upload is required' });
    }

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

    // Notify Admin
    await notify({
      userId: 'admin',
      title: 'New Fee Payment Received',
      message: `Student ${req.user.name} has submitted a payment slip for ${amount}. Transaction ID: ${transaction_id}. Please verify the receipt.`,
      type: 'payment',
      priority: 'high',
      channels: ['in-app', 'email']
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


/**
 * Fetch detailed grades and assessment breakdown for the student
 */
export const getGrades = async (req, res) => {
  try {
    const data = await studentService.getStudentGrades(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Student Grades error:', error);
    res.status(500).json({ message: 'Error fetching grades breakdown' });
  }
};

/**
 * Get a pre-signed URL for a submission file
 */
export const getSubmissionSignedUrl = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { action = 'view' } = req.query;
    
    // Ensure the student owns this submission
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    const subRes = await db.query(
      'SELECT file_url FROM submissions WHERE submission_id = $1 AND student_id = $2',
      [submissionId, studentId]
    );

    if (subRes.rows.length === 0 || !subRes.rows[0].file_url) {
      return res.status(404).json({ message: 'Submission file not found or access denied' });
    }

    const signedUrl = await getSignedFileUrl(subRes.rows[0].file_url, action);
    res.json({ url: signedUrl });
  } catch (err) {
    console.error('Signed URL error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch evaluation forms for the student
 */
export const getEvaluations = async (req, res) => {
  try {
    const data = await studentService.getStudentEvaluations(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Student Evaluations error:', error);
    res.status(500).json({ message: 'Error fetching evaluation forms' });
  }
};

/**
 * Submit evaluation response
 */
export const submitEvaluation = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ message: 'Form ID and answers are required' });
    }

    const result = await studentService.submitEvaluationResponse(req.user.id, formId, answers);

    await logAction({
      userId: req.user.id,
      action: 'EVALUATION_SUBMIT',
      target: formId,
      details: `Submitted evaluation response for form ID: ${formId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ 
      message: 'Evaluation submitted successfully! Thank you for your feedback.', 
      response: result 
    });
  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(400).json({ message: error.message || 'Submission failed' });
  }
};
