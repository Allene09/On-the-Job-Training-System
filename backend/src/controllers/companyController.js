const CompanyModel = require('../models/CompanyModel');
exports.getCompanies = async (req, res) => {
  try {
    const companies = await CompanyModel.getAll();
    return res.json({ success: true, data: companies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const result = await CompanyModel.create(req.body);
    return res.status(201).json({ success: true, message: "Company added successfully", data: { company_id: result.insertId, company_name: req.body.company_name } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be "active" or "inactive".' });
    }
    await CompanyModel.updateStatus(id, status);
    return res.json({ success: true, message: `Company ${status === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await CompanyModel.update(id, req.body);
    return res.json({ success: true, message: "Company updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
