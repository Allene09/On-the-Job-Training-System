const { pool } = require('../config/db');

class EvaluationModel {
  static async getByPlacementId(placement_id) {
    const [evals] = await pool.query('SELECT * FROM evaluations WHERE placement_id = ?', [placement_id]);
    return evals;
  }
}

module.exports = EvaluationModel;
