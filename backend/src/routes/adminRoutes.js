const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);
router.post('/requirements/type', adminController.createRequirementType);
router.get('/pending-accounts', adminController.getPendingAccounts);
router.post('/approve-account', adminController.approveAccount);
router.post('/users', adminController.createUser);
router.get('/announcements', adminController.getAnnouncements);
router.get('/notifications', adminController.getNotifications);

module.exports = router;
