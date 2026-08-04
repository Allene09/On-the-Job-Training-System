const RequirementModel = require('../models/RequirementModel');
exports.getRequirementTypes = async (req, res) => {
  try {
    const types = await RequirementModel.getAllTypes();
    return res.json({ success: true, data: types });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await RequirementModel.getSubmissions();
    return res.json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_required } = req.body;
    await RequirementModel.updateRequirementType(id, is_required);
    return res.json({ success: true, message: 'Requirement updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
