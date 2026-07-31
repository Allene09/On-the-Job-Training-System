const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registerStudent);
router.post('/change-password', authController.changePassword);

module.exports = router;
