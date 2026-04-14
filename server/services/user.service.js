import { query } from '../config/db.js';

const mockUsers = []; // In-memory fallback

export const createUser = async ({ name, email, passwordHash, role }) => {
  try {
    const sql = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, passwordHash, role];
    const { rows } = await query(sql, values);
    return rows[0];
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const mockUser = { id: Date.now().toString(), name, email, role, password_hash: passwordHash, is_active: true };
      mockUsers.push(mockUser);
      return mockUser;
    }
    throw err;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const sql = 'SELECT * FROM users WHERE email = $1 AND is_active = true;';
    const { rows } = await query(sql, [email]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return mockUsers.find(u => u.email === email && u.is_active);
    }
    throw err;
  }
};

export const findUserById = async (id) => {
  try {
    const sql = 'SELECT id, name, email, role, mfa_enabled, created_at FROM users WHERE id = $1;';
    const { rows } = await query(sql, [id]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const u = mockUsers.find(u => u.id === id);
      if (u) return { id: u.id, name: u.name, email: u.email, role: u.role, mfa_enabled: false };
    }
    throw err;
  }
};

