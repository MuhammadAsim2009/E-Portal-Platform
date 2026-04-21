import cron from 'node-cron';
import * as db from '../config/db.js';
import { notify } from './notification.service.js';

export const initCronTasks = () => {
  // 1. Assignment Deadline Reminder (Every hour)
  // Reminds students 24 hours before an assignment is due
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Cron] Checking for assignment deadlines...');
      const reminderSql = `
        SELECT a.assignment_id, a.title, a.deadline, u.user_id, c.title as course_title
        FROM assignments a
        JOIN course_sections cs ON a.section_id = cs.section_id
        JOIN enrollments e ON cs.section_id = e.section_id
        JOIN students s ON e.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN courses c ON cs.course_id = c.course_id
        LEFT JOIN submissions sub ON a.assignment_id = sub.assignment_id AND s.student_id = sub.student_id
        WHERE 
          sub.submission_id IS NULL -- Only notify if not submitted
          AND a.deadline > NOW() 
          AND a.deadline <= NOW() + INTERVAL '25 hours'
          AND a.deadline > NOW() + INTERVAL '24 hours' -- Capture those exactly in the 24-25 hour window
      `;
      const res = await db.query(reminderSql);
      
      for (const row of res.rows) {
        await notify({
          userId: row.user_id,
          title: 'Assignment Deadline Reminder',
          message: `Reminder: Your assignment "${row.title}" for ${row.course_title} is due in 24 hours (${new Date(row.deadline).toLocaleString()}).`,
          type: 'assignment',
          priority: 'urgent',
          channels: ['in-app', 'email']
        });
      }
    } catch (err) {
      console.error('[Cron] Assignment Reminder Error:', err);
    }
  });

  // 2. Fee Payment Due Reminder (Daily at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('[Cron] Checking for overdue/due fees...');
      const res = await db.query(`
        SELECT f.amount, f.fee_type, f.due_date, u.user_id, u.name
        FROM fees f
        JOIN students s ON f.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE f.status = 'pending' 
        AND f.due_date <= CURRENT_DATE + INTERVAL '3 days'
        AND f.due_date >= CURRENT_DATE
      `);

      for (const row of res.rows) {
        await notify({
          userId: row.user_id,
          title: 'Upcoming Fee Deadline',
          message: `Hello ${row.name}, your ${row.fee_type} fee of ${row.amount} is due on ${new Date(row.due_date).toLocaleDateString()}. Please ensure payment is submitted.`,
          type: 'payment',
          priority: 'high',
          channels: ['in-app', 'email']
        });
      }
    } catch (err) {
      console.error('[Cron] Fee Reminder Error:', err);
    }
  });
};
