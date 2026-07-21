const { db } = require('../config/db');

exports.getCompanies = (req, res) => {
  return res.json({ success: true, data: db.companies });
};

exports.createCompany = (req, res) => {
  const { company_name, industry, address, contact_person, contact_number, email, slots_available, added_by } = req.body;
  const newCompany = {
    company_id: db.companies.length + 1,
    company_name,
    industry,
    address,
    contact_person,
    contact_number,
    email,
    slots_available: parseInt(slots_available || 5),
    status: "active",
    added_by: parseInt(added_by || 3),
    created_at: new Date().toISOString()
  };
  db.companies.push(newCompany);
  return res.status(201).json({ success: true, message: "Company added successfully", data: newCompany });
};
