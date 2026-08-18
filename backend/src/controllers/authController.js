const AuthModel = require('../models/AuthModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const users = await AuthModel.getUserByEmail(email);
    const userMatch = users.find(u => !role || u.role.toLowerCase() === role.toLowerCase());

    if (!userMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or role" });
    }

    const user = userMatch;
    
    let isMatch = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy plaintext comparison for existing dev data
      isMatch = (password === user.password_hash || password === user.plain_password);
    }
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const profile = await AuthModel.getUserDetails(user.user_id);

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
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { email, password, first_name, middle_name, last_name, full_name, gender, course, year_section, year_level, contact_number, address, company_id, student_number } = req.body;
    
    // Construct full_name if not provided
    const constructedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ');
    
    const existing = await AuthModel.getUserByEmail(email);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Use frontend generated student number or fallback
    const resolvedStudentNumber = student_number || `2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const resolvedYearLevel = year_level || year_section || '1st Year';

    const hashedPassword = await bcrypt.hash(password || 'PENDING_APPROVAL', 10);

    await AuthModel.registerStudent({
      email,
      hashedPassword,
      plainPassword: null,
      student_number: resolvedStudentNumber,
      full_name: constructedFullName,
      first_name: first_name || '',
      middle_name: middle_name || '',
      last_name: last_name || '',
      gender: gender || '',
      course: course || '',
      resolvedYearLevel,
      contact_number: contact_number || '',
      address: address || '',
      status: 'pending_admin_approval'
    });

    if (company_id) {
      const userRows = await AuthModel.getUserByEmail(email);
      const user = userRows[0];
      if (user) {
        const details = await AuthModel.getUserDetails(user.user_id);
        if (details && details.student_id) {
          const StudentModel = require('../models/StudentModel');
          await StudentModel.applyToCompany(details.student_id, company_id);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: { email, full_name: constructedFullName }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { user_id, current_password, new_password, confirm_password } = req.body;

    if (!user_id || !new_password) {
      return res.status(400).json({ success: false, message: "User ID and new password are required" });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: "New password and confirm password do not match" });
    }

    const user = await AuthModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (current_password) {
      let isMatch = false;
      if (user.password_hash && user.password_hash.startsWith('$2')) {
        isMatch = await bcrypt.compare(current_password, user.password_hash);
      } else {
        isMatch = (current_password === user.password_hash);
      }
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result = await AuthModel.changeUserPassword(user_id, hashedPassword, new_password);

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
      current_password,
      password,
      new_password,
      confirm_password,
      first_name,
      middle_name,
      last_name,
      full_name,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department,
      contact_number,
      address
    } = req.body;

    if (!user_id || !role || !email) {
      return res.status(400).json({ success: false, message: 'user_id, role, and email are required' });
    }

    const user = await AuthModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passToChange = new_password || password;

    let hashedPassword = '';
    let plainPassword = '';

    if (passToChange) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }

      let isMatch = false;
      if (user.password_hash && user.password_hash.startsWith('$2')) {
        isMatch = await bcrypt.compare(current_password, user.password_hash);
      } else {
        isMatch = (current_password === user.password_hash);
      }

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      if (confirm_password && passToChange !== confirm_password) {
        return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
      }

      hashedPassword = await bcrypt.hash(passToChange, 10);
      plainPassword = passToChange;
    }

    const constructedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ');

    await AuthModel.updateUserProfile({
      user_id,
      role,
      email,
      hashedPassword,
      plainPassword,
      full_name: constructedFullName,
      first_name: first_name || '',
      middle_name: middle_name || '',
      last_name: last_name || '',
      student_number: student_number || '',
      course: course || '',
      year_level: year_level || '',
      gender: gender || '',
      employee_id: employee_id || '',
      department: department || '',
      contact_number: contact_number || '',
      address: address || ''
    });

    const profile = await AuthModel.getUserDetails(user_id, role);
    const userRows = await AuthModel.getUserByEmail(email);
    const updatedUser = userRows[0] || { user_id, email, role, status: user.status, requires_password_change: false };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...updatedUser, profile }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
