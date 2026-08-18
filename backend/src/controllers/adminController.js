const AdminModel = require('../models/AdminModel');
const bcrypt = require('bcrypt');

exports.getAdminStats = async (req, res) => {
  try {
    const stats = await AdminModel.getDashboardStats();

    return res.json({
      success: true,
      data: {
        total_users: stats.total_users,
        total_students: stats.total_students,
        total_staff: stats.total_staff,
        total_companies: stats.total_companies,
        active_companies: stats.active_companies,
        ongoing_placements: stats.ongoing_placements,
        completed_placements: stats.completed_placements,
        total_hours_rendered: stats.total_hours_rendered || 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getGraphicalStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const stats = await AdminModel.getMonthlyStatisticalReport(year);
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const usersData = await AdminModel.getUsers();
    const users = usersData.map(u => {
      const isPending = u.status === 'pending_admin_approval' || u.status === 'pending';
      const firstName = u.first_name || '';
      const middleName = u.middle_name || '';
      const lastName = u.last_name || '';
      const fullName = u.full_name || [firstName, middleName, lastName].filter(Boolean).join(' ') || u.email;

      // Password visibility rule: If approved/active, seen. If not yet approved, not seen (null).
      let visiblePassword = null;
      if (!isPending) {
        visiblePassword = u.plain_password || (firstName && lastName ? `${firstName}${lastName}123`.toLowerCase().replace(/\s+/g, '') : null);
      }

      const contactNumber = u.student_contact || u.staff_contact || u.contact_number || '';
      const address = u.address || '';
      const studentNumber = u.student_number || '';
      const employeeId = u.employee_id || '';
      const course = u.course || '';
      const yearLevel = u.year_level || '';
      const gender = u.gender || '';
      const department = u.department || '';

      const detailsObj = {
        full_name: fullName,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        student_number: studentNumber,
        employee_id: employeeId,
        course: course,
        year_level: yearLevel,
        gender: gender,
        contact_number: contactNumber,
        address: address,
        department: department
      };

      return {
        user_id: u.user_id,
        student_id: u.student_id,
        staff_id: u.staff_id,
        admin_id: u.admin_id,
        email: u.email,
        role: u.role,
        status: u.status,
        requires_password_change: u.requires_password_change === 1,
        created_at: u.created_at,
        full_name: fullName,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        student_number: studentNumber,
        employee_id: employeeId,
        course: course,
        year_level: yearLevel,
        gender: gender,
        contact_number: contactNumber,
        address: address,
        department: department,
        plain_password: visiblePassword,
        details: detailsObj
      };
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id || req.body.user_id);
    const { status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ success: false, message: 'user_id and status are required' });
    }

    if (!['active', 'inactive', 'pending', 'pending_admin_approval'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await AdminModel.updateUserStatus(userId, status);
    return res.json({ success: true, message: `User status updated to ${status}`, data: { user_id: userId, status } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createRequirementType = async (req, res) => {
  try {
    const result = await AdminModel.createRequirementType(req.body);
    return res.status(201).json({ success: true, message: "Requirement type added", data: { requirement_id: result.insertId, name: req.body.name, description: req.body.description, is_required: result.isReq, deadline: result.dl } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingAccounts = async (req, res) => {
  try {
    const pendingData = await AdminModel.getPendingAccounts();
    const pendingUsers = pendingData.map(u => ({
      user_id: u.user_id,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      details: {
        full_name: u.full_name,
        first_name: u.first_name,
        middle_name: u.middle_name,
        last_name: u.last_name,
        student_number: u.student_number,
        course: u.course,
        year_level: u.year_level
      }
    }));
    return res.json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveAccount = async (req, res) => {
  try {
    const { user_id } = req.body;
    const admin_id = req.user?.user_id || 1;
    
    // Find user details to generate password
    const pendingData = await AdminModel.getPendingAccounts();
    const user = pendingData.find(u => u.user_id === user_id);
    
    let generatedPassword = 'password123';
    if (user && user.first_name && user.last_name) {
      generatedPassword = `${user.first_name}${user.last_name}123`.toLowerCase().replace(/\s+/g, '');
    } else if (user && user.full_name) {
      generatedPassword = `${user.full_name.replace(/\s+/g, '')}123`.toLowerCase();
    }

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    
    await AdminModel.approveAccount(user_id, admin_id, hashedPassword, generatedPassword);
    
    // Simulate sending email
    console.log(`[SIMULATED EMAIL] Account approved! Email sent to user_id ${user_id} with password: ${generatedPassword}`);

    return res.json({ success: true, message: "Account approved successfully", generatedPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectAccount = async (req, res) => {
  try {
    const { user_id } = req.body;
    await AdminModel.rejectAccount(user_id);
    return res.json({ success: true, message: "Account rejected successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const result = await AdminModel.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user_id: result.user.user_id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        plain_password: result.user.plain_password,
        details: result.profile
      }
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Email already registered") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const rows = await AdminModel.getAnnouncements();
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { user_id } = req.query;
    const rows = await AdminModel.getNotifications(user_id);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPlacements = async (req, res) => {
  try {
    const StaffModel = require('../models/StaffModel');
    const placements = await StaffModel.getAllPlacements();
    return res.json({ success: true, data: placements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
