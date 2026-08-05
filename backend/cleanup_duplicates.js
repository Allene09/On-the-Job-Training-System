require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanDuplicates() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log("Starting DB duplicate cleanup...");

    // 1. Cleanup student_requirements (keep latest submission_id per student_id and requirement_id)
    const [reqs] = await connection.query(`
      DELETE sr1 FROM student_requirements sr1
      INNER JOIN student_requirements sr2 
      WHERE sr1.submission_id < sr2.submission_id 
      AND sr1.student_id = sr2.student_id 
      AND sr1.requirement_id = sr2.requirement_id
    `);
    console.log(`Cleaned up ${reqs.affectedRows} duplicate requirements.`);

    // 2. Cleanup weekly_reports (keep latest report_id per placement_id and week_number)
    const [reports] = await connection.query(`
      DELETE w1 FROM weekly_reports w1
      INNER JOIN weekly_reports w2 
      WHERE w1.report_id < w2.report_id 
      AND w1.placement_id = w2.placement_id 
      AND w1.week_number = w2.week_number
    `);
    console.log(`Cleaned up ${reports.affectedRows} duplicate weekly reports.`);

    // 3. Cleanup evaluations (keep latest evaluation_id per placement_id)
    const [evals] = await connection.query(`
      DELETE e1 FROM evaluations e1
      INNER JOIN evaluations e2 
      WHERE e1.evaluation_id < e2.evaluation_id 
      AND e1.placement_id = e2.placement_id
    `);
    console.log(`Cleaned up ${evals.affectedRows} duplicate evaluations.`);

    // 4. Cleanup attendance (keep latest attendance_id per placement_id and log_date)
    const [att] = await connection.query(`
      DELETE a1 FROM attendance a1
      INNER JOIN attendance a2 
      WHERE a1.attendance_id < a2.attendance_id 
      AND a1.placement_id = a2.placement_id 
      AND a1.log_date = a2.log_date
    `);
    console.log(`Cleaned up ${att.affectedRows} duplicate attendance records.`);

    console.log("Cleanup finished successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await connection.end();
  }
}

cleanDuplicates();
