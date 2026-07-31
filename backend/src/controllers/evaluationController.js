const { pool } = require('../config/db');

exports.getPlacementEvaluations = async (req, res) => {
  try {
    const { placement_id } = req.params;
    const [evals] = await pool.query('SELECT * FROM evaluations WHERE placement_id = ?', [placement_id]);
    return res.json({ success: true, data: evals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
