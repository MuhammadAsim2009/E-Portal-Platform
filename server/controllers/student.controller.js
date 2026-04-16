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
 * Get catalog of available course sections
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const rows = await courseService.getAvailableSections();
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
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
    if (studentRes.rows.length === 0) throw new Error('Student profile not found');
    const studentId = studentRes.rows[0].student_id;

    const result = await courseService.enrollStudent(studentId, sectionId);
    
    await logAction({
      userId: req.user.user_id,
      action: 'COURSE_ENROLL',
      target: sectionId,
      details: `Enrolled in section ID: ${sectionId}`,
      ipAddress: req.ip
    });

    await createNotification({
      userId: req.user.user_id,
      title: 'New Enrollment',
      message: `${req.user.name} has enrolled in a new course section.`,
      type: 'enrollment',
      relatedId: sectionId
    });

    res.status(200).json({ message: 'Successfully enrolled!', enrollment: result });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(400).json({ message: err.message || 'Enrollment failed' });
  }
};

export const submitPayment = async (req, res) => {
  try {
    const { fee_id, amount, transaction_id, payment_method, receipt_url } = req.body;
    
    const studentRes = await db.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
    const studentId = studentRes.rows[0].student_id;

    const paymentRes = await db.query(`
      INSERT INTO payments (student_id, fee_id, amount_paid, transaction_id, payment_method, receipt_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [studentId, fee_id, amount, transaction_id, payment_method, receipt_url]);

    const payment = paymentRes.rows[0];

    await logAction({
      userId: req.user.user_id,
      action: 'PAYMENT_SUBMIT',
      target: payment.payment_id,
      details: `Submitted payment slip for ${amount} (Txn: ${transaction_id})`,
      ipAddress: req.ip
    });

    await createNotification({
      userId: req.user.user_id,
      title: 'Payment Request',
      message: `${req.user.name} submitted a payment of ${amount} for fee record ${fee_id}.`,
      type: 'payment',
      priority: 'high',
      relatedId: payment.payment_id
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
