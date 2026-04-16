import { query } from '../config/db.js';

const mockUsers = []; // In-memory fallback
const mockStudents = []; // In-memory fallback
const mockFaculty = []; // In-memory fallback

export const createUser = async ({ name, email, passwordHash, role, date_of_birth, gender, contact_number, ...reqBody }) => {
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
      const studSql = `INSERT INTO students (user_id, date_of_birth, gender, contact_number) VALUES ($1, $2, $3, $4) RETURNING student_id`;
      const studRes = await query(studSql, [user.user_id, date_of_birth || null, gender || null, contact_number || null]);
      user.student_id = studRes.rows[0].student_id;
    } else if (role === 'faculty') {
      const facSql = `INSERT INTO faculty (user_id) VALUES ($1) RETURNING faculty_id`;
      const facRes = await query(facSql, [user.user_id]);
      user.faculty_id = facRes.rows[0].faculty_id;
    }

    return user;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const mockUser = { user_id: Date.now().toString(), name, email, role, password_hash: passwordHash, is_active: true };
      mockUsers.push(mockUser);
      if (role === 'student') {
        const studentId = 'stud_' + Date.now().toString();
        mockUser.student_id = studentId;
        mockStudents.push({ student_id: studentId, user_id: mockUser.user_id });
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
    const sql = 'SELECT user_id, name, email, role, mfa_enabled, created_at FROM users WHERE user_id = $1;';
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
