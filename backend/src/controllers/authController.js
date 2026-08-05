const AuthModel = require('../models/AuthModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const users = await AuthModel.searchUsers(role);
    const userMatch = users.find(u => u.email === email);

    if (!userMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or role" });
    }

    const user = userMatch;
    
    let isMatch = false;
    if (user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy plaintext comparison for existing dev data
      isMatch = (password === user.password_hash);
    }
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const profile = await AuthModel.getUserDetails(user.user_id, user.role);

    if (user.status === 'pending_admin_approval') {
      return res.status(403).json({ success: false, message: "Account is pending administrator approval." });
    }
    if (user.status === 'inactive' || user.status === 'rejected') {
      return res.status(403).json({ success: false, message: "Account has been deactivated or rejected." });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        status: user.status,
        requires_password_change: user.requires_password_change === 1,
        profile
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { email, password, first_name, middle_name, last_name, full_name, gender, course, year_section, year_level, company_id, student_number } = req.body;
    
    // Construct full_name if not provided
    const constructedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ');
    
    const existing = await AuthModel.getUserByEmail(email);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Use frontend generated student number or fallback
    const resolvedStudentNumber = student_number || `2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const resolvedYearLevel = year_level || year_section;
    if (!resolvedYearLevel) {
      return res.status(400).json({ success: false, message: 'year_level is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await AuthModel.registerStudent({
      email, hashedPassword, student_number: resolvedStudentNumber, full_name: constructedFullName, first_name, middle_name, last_name, gender, course, resolvedYearLevel
    });

    if (company_id) {
      const userRows = await AuthModel.getUserByEmail(email);
      const user = userRows[0];
      if (user) {
        const details = await AuthModel.getUserDetails(user.user_id, 'student');
        if (details && details.student_id) {
          const StudentModel = require('../models/StudentModel');
          await StudentModel.applyToCompany(details.student_id, company_id);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: { email, full_name }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const result = await AuthModel.changeUserPassword(user_id, hashedPassword);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      user_id,
      role,
      email,
      password,
      full_name,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department
    } = req.body;

    if (!user_id || !role || !email) {
      return res.status(400).json({ success: false, message: 'user_id, role, and email are required' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

    await AuthModel.updateUserProfile({
      user_id, role, email, hashedPassword, full_name, student_number, course, year_level, gender, employee_id, department
    });

    const profile = await AuthModel.getUserDetails(user_id, role);

    const userRows = await AuthModel.getUserByEmail(email);
    const user = userRows[0] || { user_id, email, role, status: 'active', requires_password_change: false };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...user, profile }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
