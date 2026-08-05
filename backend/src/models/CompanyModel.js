const { pool } = require('../config/db');

class CompanyModel {
  static async getAll() {
    const [companies] = await pool.query('SELECT * FROM companies');
    return companies;
  }

  static async create(companyData) {
    const { company_name, industry, address, contact_person, contact_number, email, slots_available, added_by, photo_url, requirements } = companyData;
    const [result] = await pool.query(
      'INSERT INTO companies (company_name, industry, address, contact_person, contact_number, email, slots_available, added_by, photo_url, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_name, industry, address, contact_person, contact_number, email, parseInt(slots_available || 5), parseInt(added_by || 3), photo_url || null, requirements || null]
    );
    return result;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE companies SET status = ? WHERE company_id = ?', [status, id]);
    return result;
  }
  static async update(id, companyData) {
    const { company_name, industry, address, contact_person, contact_number, email, slots_available, photo_url, requirements } = companyData;
    const [result] = await pool.query(
      'UPDATE companies SET company_name = ?, industry = ?, address = ?, contact_person = ?, contact_number = ?, email = ?, slots_available = ?, photo_url = ?, requirements = ? WHERE company_id = ?',
      [company_name, industry, address, contact_person, contact_number, email, parseInt(slots_available || 5), photo_url || null, requirements || null, id]
    );
    return result;
  }
}

module.exports = CompanyModel;
