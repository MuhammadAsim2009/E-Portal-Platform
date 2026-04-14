import * as userService from '../services/user.service.js';
import * as authService from '../services/auth.service.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Hash password & Create user
    const passwordHash = await authService.hashPassword(password);
    const newUser = await userService.createUser({ name, email, passwordHash, role });

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

    // Check MFA status (Placeholder for next iteration)
    if (user.mfa_enabled) {
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
      maxAge: 15 * 60 * 1000 // 15 mins
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
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
 * Get current session user
 */
export const getMe = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User session no longer valid.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user session.' });
  }
};
