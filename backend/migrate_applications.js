require('dotenv').config();
const { pool } = require('./src/config/db');

async function migrate() {
  try {
    console.log('--- Starting Migration ---');

    // 1. Add note column to applications if it does not exist
    const [columns] = await pool.query("SHOW COLUMNS FROM applications LIKE 'note'");
    if (columns.length === 0) {
      console.log('Adding note column to applications...');
      await pool.query("ALTER TABLE applications ADD COLUMN note TEXT DEFAULT NULL AFTER company_id");
      console.log('✓ note column added.');
    } else {
      console.log('✓ note column already exists.');
    }

    // 2. Create application_documents table if not exists
    console.log('Creating application_documents table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`application_documents\` (
        \`document_id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`application_id\` INT(11) NOT NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`file_path\` VARCHAR(255) NOT NULL,
        \`file_size\` INT(11) DEFAULT NULL,
        \`uploaded_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`document_id\`),
        KEY \`application_id\` (\`application_id\`),
        CONSTRAINT \`application_documents_ibfk_1\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\` (\`application_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    `);
    console.log('✓ application_documents table created/verified.');

    // 3. Update sp_ApplyToCompany
    console.log('Updating sp_ApplyToCompany...');
    await pool.query("DROP PROCEDURE IF EXISTS `sp_ApplyToCompany`");
    await pool.query(`
      CREATE PROCEDURE \`sp_ApplyToCompany\`(
          IN p_student_id INT,
          IN p_company_id INT,
          IN p_note TEXT
      )
      BEGIN
          INSERT INTO applications (student_id, company_id, note, status)
          VALUES (p_student_id, p_company_id, p_note, 'pending');
          
          SELECT LAST_INSERT_ID() AS application_id;
      END
    `);
    console.log('✓ sp_ApplyToCompany updated.');

    // 4. Create sp_AddApplicationDocument
    console.log('Updating sp_AddApplicationDocument...');
    await pool.query("DROP PROCEDURE IF EXISTS `sp_AddApplicationDocument`");
    await pool.query(`
      CREATE PROCEDURE \`sp_AddApplicationDocument\`(
          IN p_application_id INT,
          IN p_file_name VARCHAR(255),
          IN p_file_path VARCHAR(255),
          IN p_file_size INT
      )
      BEGIN
          INSERT INTO application_documents (application_id, file_name, file_path, file_size)
          VALUES (p_application_id, p_file_name, p_file_path, p_file_size);
      END
    `);
    console.log('✓ sp_AddApplicationDocument created.');

    // 5. Create sp_GetApplicationDocuments
    console.log('Updating sp_GetApplicationDocuments...');
    await pool.query("DROP PROCEDURE IF EXISTS `sp_GetApplicationDocuments`");
    await pool.query(`
      CREATE PROCEDURE \`sp_GetApplicationDocuments\`(
          IN p_application_id INT
      )
      BEGIN
          SELECT * FROM application_documents WHERE application_id = p_application_id;
      END
    `);
    console.log('✓ sp_GetApplicationDocuments created.');

    // 6. Create sp_GetApplicationsByStudentId
    console.log('Updating sp_GetApplicationsByStudentId...');
    await pool.query("DROP PROCEDURE IF EXISTS `sp_GetApplicationsByStudentId`");
    await pool.query(`
      CREATE PROCEDURE \`sp_GetApplicationsByStudentId\`(
          IN p_student_id INT
      )
      BEGIN
          SELECT a.*, c.company_name, c.industry, c.photo_url, c.address
          FROM applications a
          JOIN companies c ON a.company_id = c.company_id
          WHERE a.student_id = p_student_id
          ORDER BY a.applied_at DESC;
      END
    `);
    console.log('✓ sp_GetApplicationsByStudentId created.');

    // 7. Update sp_GetAllApplications
    console.log('Updating sp_GetAllApplications...');
    await pool.query("DROP PROCEDURE IF EXISTS `sp_GetAllApplications`");
    await pool.query(`
      CREATE PROCEDURE \`sp_GetAllApplications\`()
      BEGIN
          SELECT a.*, s.full_name as student_name, s.course, s.year_level, s.student_number,
                 c.company_name, c.industry, c.photo_url, c.address
          FROM applications a
          JOIN students s ON a.student_id = s.student_id
          JOIN companies c ON a.company_id = c.company_id
          ORDER BY a.applied_at DESC;
      END
    `);
    console.log('✓ sp_GetAllApplications updated.');

    console.log('--- Migration Finished Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
