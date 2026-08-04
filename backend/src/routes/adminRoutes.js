const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin, isAdminOrStaff } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, isAdmin, adminController.getAdminStats);
router.get('/users', verifyToken, isAdminOrStaff, adminController.getUsers);
router.post('/requirements/type', verifyToken, isAdmin, adminController.createRequirementType);
router.get('/pending-accounts', verifyToken, isAdmin, adminController.getPendingAccounts);
router.post('/approve-account', verifyToken, isAdmin, adminController.approveAccount);
router.post('/users', verifyToken, isAdmin, adminController.createUser);
router.get('/announcements', verifyToken, adminController.getAnnouncements);
router.get('/notifications', verifyToken, adminController.getNotifications);

module.exports = router;
