import { createNotification } from './admin.service.js';
import { sendEmail } from './email.service.js';
import * as db from '../config/db.js';

/**
 * Enhanced notification orchestrator that handles both In-App and Email notifications.
 * @param {Object} params
 * @param {string} params.userId - Target user ID (or 'admin' for all admins)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {string} params.type - Category (assignment, payment, system, etc.)
 * @param {string} [params.priority='medium'] - priority level
 * @param {string} [params.relatedId=null] - Related resource ID
 * @param {boolean} [params.sendEmail=true] - Whether to send an email too
 * @param {string} [params.emailTo=null] - Overrides user's email if provided
 */
export const notify = async ({ 
  userId, 
  title, 
  message, 
  type, 
  priority = 'medium', 
  relatedId = null,
  channels = ['in-app', 'email'],
  emailData = {} // Custom HTML/Text for email if different from in-app
}) => {
  try {
    const results = {};

    // 1. Handle In-App Notification
    if (channels.includes('in-app')) {
      if (userId === 'all' || userId === 'student' || userId === 'faculty' || userId === 'admin') {
        let sql = "SELECT user_id FROM users WHERE is_active = true";
        let params = [];
        if (userId !== 'all') {
          sql += " AND LOWER(role) = LOWER($1)";
          params.push(userId);
        }
        
        const targetUsers = await db.query(sql, params);
        for (const user of targetUsers.rows) {
          await createNotification({ userId: user.user_id, title, message, type, priority, relatedId });
        }
      } else {
        results.inApp = await createNotification({ userId, title, message, type, priority, relatedId });
      }
    }

    // 2. Handle Email Notification
    if (channels.includes('email')) {
      let recipients = [];
      if (userId === 'all' || userId === 'student' || userId === 'faculty' || userId === 'admin') {
        let sql = "SELECT email FROM users WHERE is_active = true";
        let params = [];
        if (userId !== 'all') {
          sql += " AND LOWER(role) = LOWER($1)";
          params.push(userId);
        }
        const targetUsers = await db.query(sql, params);
        recipients = targetUsers.rows.map(a => a.email);
      } else {
        const user = await db.query("SELECT email FROM users WHERE user_id = $1", [userId]);
        if (user.rows[0]) recipients.push(user.rows[0].email);
      }

      if (recipients.length > 0) {
        results.email = await sendEmail({
          to: recipients,
          subject: title,
          text: message,
          html: emailData.html || `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto;">
              <div style="background: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
                <h2 style="margin: 0; font-size: 20px;">${title}</h2>
              </div>
              <div style="padding: 20px; color: #334155; line-height: 1.6;">
                <p>${message}</p>
                ${relatedId ? `<p style="margin-top: 20px;"><small>Reference ID: ${relatedId}</small></p>` : ''}
              </div>
              <div style="padding: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
                Sent via E-Portal Institutional Command Center
              </div>
            </div>
          `
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Unified Notification Error:', error);
    // Don't throw, we don't want to break the main flow if email fails
  }
};
