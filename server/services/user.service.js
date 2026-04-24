import { query } from '../config/db.js';
import { sendEmail } from './email.service.js';

const mockUsers = []; // In-memory fallback
const mockStudents = []; // In-memory fallback
const mockFaculty = []; // In-memory fallback

export const createUser = async ({ name, email, passwordHash, role, cnic, date_of_birth, gender, contact_number, ...reqBody }) => {
  try {
    const sql = `
      INSERT INTO users (name, email, password_hash, role, registration_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, name, email, role, registration_status, created_at;
    `;
    const status = (reqBody && reqBody.is_admin_created) ? 'approved' : 'pending';
    const values = [name, email, passwordHash, role, status];
    const { rows } = await query(sql, values);
    const user = rows[0];

    if (role === 'student') {
      const studSql = `INSERT INTO students (user_id, cnic, date_of_birth, gender, contact_number) VALUES ($1, $2, $3, $4, $5) RETURNING student_id`;
      const studRes = await query(studSql, [user.user_id, cnic || null, date_of_birth || null, gender || null, contact_number || null]);
      user.student_id = studRes.rows[0].student_id;
    } else if (role === 'faculty') {
      const facSql = `
        INSERT INTO faculty (user_id, department, designation, contact_number, qualifications) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING faculty_id
      `;
      const facRes = await query(facSql, [
        user.user_id, 
        reqBody.department || null, 
        reqBody.designation || null, 
        contact_number || null, 
        reqBody.qualifications || null
      ]);
      user.faculty_id = facRes.rows[0].faculty_id;
    }

    // Send Notification Email if Admin Created
    if (status === 'approved') {
      sendEmail({
        to: email,
        subject: 'Welcome to E-Portal Platform',
        text: `Hello ${name}, your account has been created on E-Portal. Your role is ${role}.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #4f46e5;">Welcome to E-Portal</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your institutional account has been successfully created.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Role:</strong> ${role.toUpperCase()}</p>
              <p style="margin: 4px 0 0 0;"><strong>Email:</strong> ${email}</p>
            </div>
            <p>Please login using your credentials.</p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">This is an automated message. Please do not reply.</p>
          </div>
        `
      }).catch(err => console.error('Create User Email Error:', err));
    }

    return user;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const mockUser = { user_id: Date.now().toString(), name, email, role, password_hash: passwordHash, is_active: true };
      mockUsers.push(mockUser);
      if (role === 'student') {
        const studentId = 'stud_' + Date.now().toString();
        mockUser.student_id = studentId;
        mockStudents.push({ student_id: studentId, user_id: mockUser.user_id, cnic, date_of_birth, gender, contact_number });
      } else if (role === 'faculty') {
        const facultyId = 'fac_' + Date.now().toString();
        mockUser.faculty_id = facultyId;
        mockFaculty.push({ faculty_id: facultyId, user_id: mockUser.user_id });
      }
      return mockUser;
    }
    throw err;
  }
};

export const findUserByEmail = async (email) => {
  try {
    // Fetch regardless of is_active so we can return a specific suspension message
    const sql = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await query(sql, [email]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return mockUsers.find(u => u.email === email);
    }
    throw err;
  }
};

export const findUserById = async (id) => {
  try {
    const sql = `
      SELECT u.user_id, u.name, u.email, u.role, u.mfa_enabled, u.created_at,
             f.department, f.designation
      FROM users u
      LEFT JOIN faculty f ON u.user_id = f.user_id
      WHERE u.user_id = $1;
    `;
    const { rows } = await query(sql, [id]);
    return rows[0];

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const u = mockUsers.find(u => u.user_id === id);
      if (u) return { user_id: u.user_id, name: u.name, email: u.email, role: u.role, mfa_enabled: false };
    }
    throw err;
  }
};
