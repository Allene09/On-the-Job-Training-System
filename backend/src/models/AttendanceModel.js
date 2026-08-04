const { pool } = require('../config/db');

class AttendanceModel {
  static async getByPlacementId(placement_id) {
    const [records] = await pool.query('SELECT * FROM attendance WHERE placement_id = ?', [placement_id]);
    return records;
  }

  static async getPlacementById(placement_id) {
    const [placements] = await pool.query('SELECT required_hours, total_hours_rendered, status FROM ojt_placements WHERE placement_id = ?', [placement_id]);
    return placements[0];
  }

  static async getProgress(placement_id) {
    const p = await this.getPlacementById(placement_id);
    if (!p) return null;
    return {
      placement_id: parseInt(placement_id),
      required_hours: p.required_hours,
      total_hours_rendered: p.total_hours_rendered,
      progress_percent: Math.min(parseFloat(((p.total_hours_rendered / p.required_hours) * 100).toFixed(2)), 100),
      status: p.status
    };
  }

  static async addRecord(placement_id, log_date, time_in, time_out, hours_rendered, remarks) {
    await pool.query(
      'CALL sp_RecordAttendance(?, ?, ?, ?)',
      [placement_id, log_date, time_in, time_out]
    );
    const [newRecord] = await pool.query('SELECT * FROM attendance WHERE placement_id = ? AND log_date = ? ORDER BY attendance_id DESC LIMIT 1', [placement_id, log_date]);
    return newRecord[0];
  }
}

module.exports = AttendanceModel;
