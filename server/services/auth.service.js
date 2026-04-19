import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

import pool from '../config/db.js';

/**
 * Hashes a plain text password
 */
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares plain password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generates both access and refresh tokens
 */
export const generateTokens = (user) => {
  const payload = { id: user.user_id, role: user.role };
  
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
};

/**
 * Verifies an access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verifies a refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

/**
 * Generates and stores a 6rd digit MFA code
 */
export const generateMFACode = async (userId) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await pool.query(
    'INSERT INTO mfa_codes (user_id, code, expires_at) VALUES ($1, $2, $3)',
    [userId, code, expiresAt]
  );

  return code;
};

/**
 * Verifies MFA code and deletes it if successful
 */
export const verifyMFACode = async (userId, code) => {
  const { rows } = await pool.query(
    'SELECT * FROM mfa_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [userId, code]
  );

  if (rows.length > 0) {
    // Code valid, cleanup
    await pool.query('DELETE FROM mfa_codes WHERE user_id = $1', [userId]);
    return true;
  }
  return false;
};
