const AdminModel = require('../models/AdminModel');

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

exports.getUsers = async (req, res) => {
  try {
    const usersData = await AdminModel.getUsers();
    const users = usersData.map(u => ({
      user_id: u.user_id,
      student_id: u.student_id,
      staff_id: u.staff_id,
      email: u.email,
      role: u.role,
      status: u.status,
      requires_password_change: u.requires_password_change,
      created_at: u.created_at,
      full_name: u.student_name || u.staff_name || u.admin_name,
      student_number: u.student_number,
      employee_id: u.employee_id,
      course: u.course,
      details: {
        full_name: u.student_name || u.staff_name || u.admin_name,
        student_number: u.student_number,
        employee_id: u.employee_id,
        course: u.course
      }
    }));
    return res.json({ success: true, data: users });
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
    await AdminModel.approveAccount(user_id);
    
    // Simulate sending email
    console.log(`[SIMULATED EMAIL] Account approved! Email sent to user_id ${user_id} with default password.`);

    return res.json({ success: true, message: "Account approved successfully" });
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
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
