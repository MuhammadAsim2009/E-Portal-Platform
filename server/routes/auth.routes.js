import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshAccessToken);

// Protected routes
router.use(authenticateJWT);
router.get('/me', authController.getMe);
router.post('/contact-admin', authController.contactAdmin);

export default router;
