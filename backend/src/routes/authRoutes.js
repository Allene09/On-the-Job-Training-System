const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.registerStudent);
router.post('/change-password', authController.changePassword);
router.put('/profile', authController.updateProfile);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
