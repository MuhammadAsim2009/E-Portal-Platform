import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

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
  const payload = { id: user.id, role: user.role };
  
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
