const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.getCompanies);
router.post('/', companyController.createCompany);
router.put('/:id/status', companyController.updateCompanyStatus);

module.exports = router;
