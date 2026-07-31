const { pool } = require('../config/db');

exports.getCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query('SELECT * FROM companies');
    return res.json({ success: true, data: companies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { company_name, industry, address, contact_person, contact_number, email, slots_available, added_by } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO companies (company_name, industry, address, contact_person, contact_number, email, slots_available, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [company_name, industry, address, contact_person, contact_number, email, parseInt(slots_available || 5), parseInt(added_by || 3)]
    );

    return res.status(201).json({ success: true, message: "Company added successfully", data: { company_id: result.insertId, company_name } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
