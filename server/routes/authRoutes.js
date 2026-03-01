const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

// Admin-only routes
router.get('/admin', authMiddleware, requireRole('admin'), authController.adminPing);
router.get('/users', authMiddleware, requireRole('admin'), authController.getAllUsers);

// Dev-only utility route (disabled in production)
router.post('/make-admin', authController.makeAdmin);

module.exports = router;
