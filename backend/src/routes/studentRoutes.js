const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../frontend/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'doc_' + Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(verifyToken, isStudent);
router.get('/dashboard', studentController.getDashboardData);
router.get('/requirements', studentController.getRequirements);
router.get('/placements', studentController.getPlacements);
router.get('/applications', studentController.getApplications);
router.get('/weekly-reports', studentController.getWeeklyReports);
router.post('/requirements/submit', studentController.submitRequirement);
router.post('/apply', upload.array('documents', 10), studentController.applyToCompany);
router.post('/weekly-report', studentController.submitWeeklyReport);

module.exports = router;
