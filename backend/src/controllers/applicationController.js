const ApplicationModel = require('../models/ApplicationModel');
exports.getApplications = async (req, res) => {
  try {
    const applications = await ApplicationModel.getAll();
    return res.json({ success: true, data: applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
