const { db } = require('../config/db');

exports.getAdminStats = (req, res) => {
  const completedPlacements = db.ojt_placements.filter(p => p.status === 'completed').length;
  const ongoingPlacements = db.ojt_placements.filter(p => p.status === 'ongoing').length;

  return res.json({
    success: true,
    data: {
      total_users: db.users.length,
      total_students: db.students.length,
      total_staff: db.staff.length,
      total_companies: db.companies.length,
      active_companies: db.companies.filter(c => c.status === 'active').length,
      ongoing_placements: ongoingPlacements,
      completed_placements: completedPlacements,
      total_hours_rendered: db.attendance.reduce((sum, a) => sum + (a.hours_rendered || 0), 0)
    }
  });
};

exports.getUsers = (req, res) => {
  const fullUsers = db.users.map(u => {
    let details = null;
    if (u.role === 'student') details = db.students.find(s => s.user_id === u.user_id);
    else if (u.role === 'staff') details = db.staff.find(s => s.user_id === u.user_id);
    else if (u.role === 'admin') details = db.admins.find(a => a.user_id === u.user_id);
    return { ...u, details };
  });
  return res.json({ success: true, data: fullUsers });
};

exports.createRequirementType = (req, res) => {
  const { name, description, is_required, deadline } = req.body;
  const newReq = {
    requirement_id: db.requirement_types.length + 1,
    name,
    description,
    is_required: is_required !== undefined ? is_required : true,
    deadline: deadline || "2026-09-30"
  };
  db.requirement_types.push(newReq);
  return res.status(201).json({ success: true, message: "Requirement type added", data: newReq });
};
