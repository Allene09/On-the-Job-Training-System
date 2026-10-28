// Migration: Adds 'recommended' enum status and recommendation tracking fields to applications table
import pool from '../src/config/database.js';

async function run() {
  try {
    console.log('Verifying applications table recommendation schema...');
    
    // Check if columns exist
    const [cols] = await pool.query("SHOW COLUMNS FROM applications LIKE 'recommended_by'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE applications MODIFY COLUMN status ENUM('pending', 'recommended', 'accepted', 'rejected') DEFAULT 'pending'");
      await pool.query("ALTER TABLE applications ADD COLUMN recommended_by INT NULL, ADD COLUMN recommended_at DATETIME NULL, ADD COLUMN recommendation_notes TEXT NULL");
      await pool.query("ALTER TABLE applications ADD CONSTRAINT fk_app_rec_by FOREIGN KEY (recommended_by) REFERENCES users(user_id) ON DELETE SET NULL");
      console.log('Added recommendation fields.');
    } else {
      console.log('Recommendation schema already in place.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

run();
