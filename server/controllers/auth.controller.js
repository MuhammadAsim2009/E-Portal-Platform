import * as userService from '../services/user.service.js';
import * as authService from '../services/auth.service.js';
import { sendEmail } from '../services/email.service.js';
import { logAction, createNotification, getSiteSettings } from '../services/admin.service.js';
import { notify } from '../services/notification.service.js';
import crypto from 'crypto';
import * as db from '../config/db.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, cnic, date_of_birth, gender, contact_number } = req.body;

    // Check if user exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Hash password & Create user
    const passwordHash = await authService.hashPassword(password);
    const newUser = await userService.createUser({ 
      name, 
      email, 
      passwordHash, 
      role, 
      cnic, 
      date_of_birth, 
      gender, 
      contact_number 
    });

    await logAction({
      userId: newUser.user_id,
      action: 'USER_REGISTER',
      details: `New ${role} registration: ${email}`,
      ipAddress: req.ip
    });

    await createNotification({
      userId: newUser.user_id,
      title: 'New Registration',
      message: `${name} (${role}) has registered and is waiting for approval.`,
      type: 'registration',
      priority: 'high',
      relatedId: newUser.user_id
    });

    res.status(201).json({
      message: 'Registration successful!',
      user: { id: newUser.user_id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * Login user and set secure cookies
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await authService.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if account is suspended
    if (!user.is_active) {
      return res.status(403).json({ 
        message: 'Your account has been suspended by Admin. Please contact the admin or your teacher.' 
      });
    }

    // Check Registration Status
    if (user.registration_status !== 'approved') {
      const msg = user.registration_status === 'pending' 
        ? 'Your account is pending admin approval. Please check back later.'
        : 'Your registration has been rejected. Please contact support.';
      return res.status(403).json({ message: msg });
    }

    // Check MFA status (Placeholder for next iteration)
    if (user.mfa_enabled) {
      const code = await authService.generateMFACode(user.user_id);
      
      await sendEmail({
        to: user.email,
        subject: 'E-Portal Login Verification Code',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Verification Code</h2>
            <p>Your verification code for E-Portal is:</p>
            <div style="font-size: 32px; font-weight: bold; padding: 10px; background: #f4f4f4; border-radius: 5px; display: inline-block; letter-spacing: 5px;">
              ${code}
            </div>
            <p style="color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
          </div>
        `
      });

      return res.status(200).json({ 
        message: 'MFA REQUIRED', 
        userId: user.user_id 
      });
    }

    // Generate Tokens
    const { accessToken, refreshToken } = authService.generateTokens(user);

    // Set Cookies (Secure, HttpOnly)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful!',
      user: { id: user.user_id, name: user.name, email: user.email, role: user.role }
    });

    await logAction({
      userId: user.user_id,
      action: 'USER_LOGIN',
      details: `Successful login for ${email}`,
      ipAddress: req.ip
    });

    // --- NEW DEVICE DETECTION ---
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const fingerprint = req.body.fingerprint || crypto.createHash('md5').update(userAgent).digest('hex');
    
    const deviceCheck = await db.query(
      "SELECT * FROM login_devices WHERE user_id = $1 AND device_fingerprint = $2",
      [user.user_id, fingerprint]
    );

    if (deviceCheck.rowCount === 0) {
      // New Device Detected
      await db.query(
        "INSERT INTO login_devices (user_id, device_fingerprint, user_agent, last_ip) VALUES ($1, $2, $3, $4)",
        [user.user_id, fingerprint, userAgent, req.ip]
      );

      await notify({
        userId: user.user_id,
        title: 'New Device Login Detected',
        message: `Your account was just logged into from a new device: ${userAgent} at IP: ${req.ip}. If this wasn't you, please change your password immediately.`,
        type: 'system',
        priority: 'high',
        channels: ['in-app', 'email']
      });
    } else {
      // Update last seen
      await db.query(
        "UPDATE login_devices SET last_ip = $1, last_login = NOW() WHERE device_id = $2",
        [req.ip, deviceCheck.rows[0].device_id]
      );
    }
    // ---------------------------
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

/**
 * Verify MFA code and generate session
 */
export const verifyMFA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isValid = await authService.verifyMFACode(userId, code);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired verification code.' });
    }

    // Generate Tokens
    const { accessToken, refreshToken } = authService.generateTokens(user);

    // Set Cookies (Secure, HttpOnly)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'MFA Verified! Login successful!',
      user: { id: user.user_id, name: user.name, email: user.email, role: user.role }
    });

    await logAction({
      userId: user.user_id,
      action: 'MFA_VERIFIED',
      details: `MFA successful for ${user.email}`,
      ipAddress: req.ip
    });

    // --- NEW DEVICE DETECTION (After MFA) ---
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const fingerprint = req.body.fingerprint || crypto.createHash('md5').update(userAgent).digest('hex');
    
    const deviceCheck = await db.query(
      "SELECT * FROM login_devices WHERE user_id = $1 AND device_fingerprint = $2",
      [user.user_id, fingerprint]
    );

    if (deviceCheck.rowCount === 0) {
      await db.query(
        "INSERT INTO login_devices (user_id, device_fingerprint, user_agent, last_ip) VALUES ($1, $2, $3, $4)",
        [user.user_id, fingerprint, userAgent, req.ip]
      );

      await notify({
        userId: user.user_id,
        title: 'New Device Login Detected',
        message: `Your account was just logged into from a new device: ${userAgent} at IP: ${req.ip}. If this wasn't you, please change your password immediately.`,
        type: 'system',
        priority: 'high',
        channels: ['in-app', 'email']
      });
    } else {
      await db.query(
        "UPDATE login_devices SET last_ip = $1, last_login = NOW() WHERE device_id = $2",
        [req.ip, deviceCheck.rows[0].device_id]
      );
    }
    // ----------------------------------------
  } catch (error) {
    console.error('MFA Verify error:', error);
    res.status(500).json({ message: 'Internal server error during MFA verification.' });
  }
};

/**
 * Logout user by clearing cookies
 */
export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * Get current session user — Silently handles non-authenticated state
 */
export const getMe = async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    
    // Fetch global site settings for branding/ui config
    const siteSettings = await getSiteSettings();
    
    if (!token) {
      return res.status(200).json({ authenticated: false, user: null, siteSettings });
    }

    let decoded;
    try {
      decoded = authService.verifyAccessToken(token);
    } catch {
      return res.status(200).json({ authenticated: false, user: null, siteSettings });
    }

    const user = await userService.findUserById(decoded.id);
    if (!user) {
      return res.status(200).json({ authenticated: false, user: null, siteSettings });
    }

    res.status(200).json({ authenticated: true, user, siteSettings });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Error retrieving user session.' });
  }
};

/**
 * Silently refresh access token using refresh token cookie
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    let payload;
    try {
      payload = authService.verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
    }

    const user = await userService.findUserById(payload.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Account not found or suspended.' });
    }

    const { accessToken } = authService.generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.status(200).json({ message: 'Token refreshed.' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error during token refresh.' });
  }
};

/**
 * Send a notification/message to Admin
 */
export const contactAdmin = async (req, res) => {
  try {
    const { title, message, priority = 'medium' } = req.body;
    
    await logAction({
      userId: req.user.id,
      action: 'CONTACT_ADMIN',
      details: `User sent a message to Admin: ${title}`,
      ipAddress: req.ip
    });

    await createNotification({
      userId: req.user.id,
      title: `User Message: ${title}`,
      message: message,
      type: 'message',
      priority: priority
    });

    res.status(200).json({ message: 'Message sent to Admin successfully.' });
  } catch (error) {
    console.error('Contact Admin error:', error);
    res.status(500).json({ message: 'Error sending message to Admin.' });
  }
};
