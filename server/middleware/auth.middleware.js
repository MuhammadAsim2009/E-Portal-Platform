import { verifyAccessToken } from '../services/auth.service.js';

/**
 * Middleware to authenticate JWT from HttpOnly cookies
 */
export const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {Array} roles - Allowed roles e.g. ['admin', 'faculty']
 */
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted to ${roles.join(' or ')} only.` 
      });
    }
    next();
  };
};
