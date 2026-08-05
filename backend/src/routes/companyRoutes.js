const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

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
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', companyController.getCompanies);
router.post('/', companyController.createCompany);
router.put('/:id/status', companyController.updateCompanyStatus);
router.put('/:id', companyController.updateCompany);
router.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  return res.json({ success: true, photo_url: `/uploads/${req.file.filename}` });
});

module.exports = router;
