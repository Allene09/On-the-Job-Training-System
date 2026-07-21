const { db } = require('../config/db');

exports.getPlacementEvaluations = (req, res) => {
  const { placement_id } = req.params;
  const evals = db.evaluations.filter(e => e.placement_id === parseInt(placement_id));
  return res.json({ success: true, data: evals });
};
