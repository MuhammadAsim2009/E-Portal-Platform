import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-mfa', authController.verifyMFA);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshAccessToken);
router.get('/me', authController.getMe); // Check session silently

// Protected routes
router.use(authenticateJWT);
router.post('/contact-admin', authController.contactAdmin);
router.post('/change-password', authController.changePassword);

export default router;
