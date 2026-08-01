DELIMITER $$

-- Admin Procedures
DROP PROCEDURE IF EXISTS `sp_GetAdminDashboardStats`$$
CREATE PROCEDURE `sp_GetAdminDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'completed') AS completed_placements,
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'ongoing') AS ongoing_placements,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM staff) AS total_staff;
END$$

DROP PROCEDURE IF EXISTS `sp_GetPendingAccounts`$$
CREATE PROCEDURE `sp_GetPendingAccounts`()
BEGIN
    SELECT u.user_id, u.email, u.role, u.status, u.created_at, s.student_number, s.full_name, s.course, s.year_level
    FROM users u
    JOIN students s ON u.user_id = s.user_id
    WHERE u.status = 'pending_admin_approval';
END$$

DROP PROCEDURE IF EXISTS `sp_ApproveAccount`$$
CREATE PROCEDURE `sp_ApproveAccount`(IN p_user_id INT)
BEGIN
    UPDATE users SET status = 'active' WHERE user_id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS `sp_CreateAnnouncement`$$
CREATE PROCEDURE `sp_CreateAnnouncement`(IN p_posted_by INT, IN p_title VARCHAR(150), IN p_content TEXT)
BEGIN
    INSERT INTO announcements (posted_by, title, content) VALUES (p_posted_by, p_title, p_content);
END$$

DROP PROCEDURE IF EXISTS `sp_GetAnnouncements`$$
CREATE PROCEDURE `sp_GetAnnouncements`()
BEGIN
    SELECT * FROM announcements ORDER BY created_at DESC;
END$$

-- Application Procedures
DROP PROCEDURE IF EXISTS `sp_GetAllApplications`$$
CREATE PROCEDURE `sp_GetAllApplications`()
BEGIN
    SELECT a.*, s.full_name, s.course, s.year_level, s.student_number, c.company_name
    FROM applications a
    JOIN students s ON a.student_id = s.student_id
    JOIN companies c ON a.company_id = c.company_id
    ORDER BY a.applied_at DESC;
END$$

-- Attendance Procedures
DROP PROCEDURE IF EXISTS `sp_GetAttendanceByPlacementId`$$
CREATE PROCEDURE `sp_GetAttendanceByPlacementId`(IN p_placement_id INT)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id;
END$$

DROP PROCEDURE IF EXISTS `sp_GetPlacementStats`$$
CREATE PROCEDURE `sp_GetPlacementStats`(IN p_placement_id INT)
BEGIN
    SELECT required_hours, total_hours_rendered, status FROM ojt_placements WHERE placement_id = p_placement_id;
END$$

DROP PROCEDURE IF EXISTS `sp_GetLatestAttendanceRecord`$$
CREATE PROCEDURE `sp_GetLatestAttendanceRecord`(IN p_placement_id INT, IN p_log_date DATE)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id AND log_date = p_log_date ORDER BY attendance_id DESC LIMIT 1;
END$$

-- Auth / User Procedures
DROP PROCEDURE IF EXISTS `sp_SearchUsers`$$
CREATE PROCEDURE `sp_SearchUsers`(IN p_role VARCHAR(50), IN p_status VARCHAR(50))
BEGIN
    SELECT u.*, 
        s.full_name AS student_name, s.student_number,
        st.full_name AS staff_name, st.employee_id,
        a.full_name AS admin_name
    FROM users u
    LEFT JOIN students s ON u.user_id = s.user_id
    LEFT JOIN staff st ON u.user_id = st.user_id
    LEFT JOIN admins a ON u.user_id = a.user_id
    WHERE (p_role IS NULL OR p_role = '' OR u.role = p_role)
      AND (p_status IS NULL OR p_status = '' OR u.status = p_status)
    ORDER BY u.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_GetUserDetails`$$
CREATE PROCEDURE `sp_GetUserDetails`(IN p_user_id INT, IN p_role VARCHAR(50))
BEGIN
    IF p_role = 'student' THEN
        SELECT * FROM students WHERE user_id = p_user_id;
    ELSEIF p_role = 'staff' THEN
        SELECT * FROM staff WHERE user_id = p_user_id;
    ELSEIF p_role = 'admin' THEN
        SELECT * FROM admins WHERE user_id = p_user_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_GetUserByEmail`$$
CREATE PROCEDURE `sp_GetUserByEmail`(IN p_email VARCHAR(150))
BEGIN
    SELECT * FROM users WHERE email = p_email;
END$$

DROP PROCEDURE IF EXISTS `sp_ChangeUserPassword`$$
CREATE PROCEDURE `sp_ChangeUserPassword`(IN p_user_id INT, IN p_new_password VARCHAR(255))
BEGIN
    UPDATE users SET password_hash = p_new_password, requires_password_change = 0 WHERE user_id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS `sp_GetAllUsers`$$
CREATE PROCEDURE `sp_GetAllUsers`()
BEGIN
    SELECT * FROM users;
END$$

-- Company Procedures
DROP PROCEDURE IF EXISTS `sp_GetAllCompanies`$$
CREATE PROCEDURE `sp_GetAllCompanies`()
BEGIN
    SELECT * FROM companies;
END$$

DROP PROCEDURE IF EXISTS `sp_AddCompany`$$
CREATE PROCEDURE `sp_AddCompany`(
    IN p_company_name VARCHAR(150), IN p_industry VARCHAR(100), IN p_address VARCHAR(255), 
    IN p_contact_person VARCHAR(100), IN p_contact_number VARCHAR(20), IN p_email VARCHAR(150), 
    IN p_slots_available INT, IN p_photo_url VARCHAR(255), IN p_requirements TEXT, IN p_added_by INT
)
BEGIN
    INSERT INTO companies (company_name, industry, address, contact_person, contact_number, email, slots_available, photo_url, requirements, added_by)
    VALUES (p_company_name, p_industry, p_address, p_contact_person, p_contact_number, p_email, p_slots_available, p_photo_url, p_requirements, p_added_by);
    SELECT LAST_INSERT_ID() AS company_id;
END$$

DROP PROCEDURE IF EXISTS `sp_UpdateCompanyStatus`$$
CREATE PROCEDURE `sp_UpdateCompanyStatus`(IN p_company_id INT, IN p_status ENUM('active', 'inactive'))
BEGIN
    UPDATE companies SET status = p_status WHERE company_id = p_company_id;
END$$

-- Evaluation Procedures
DROP PROCEDURE IF EXISTS `sp_GetEvaluationsByPlacementId`$$
CREATE PROCEDURE `sp_GetEvaluationsByPlacementId`(IN p_placement_id INT)
BEGIN
    SELECT * FROM evaluations WHERE placement_id = p_placement_id;
END$$

-- Requirement Procedures
DROP PROCEDURE IF EXISTS `sp_GetRequirementTypes`$$
CREATE PROCEDURE `sp_GetRequirementTypes`()
BEGIN
    SELECT * FROM requirement_types;
END$$

DROP PROCEDURE IF EXISTS `sp_GetAllStudentRequirements`$$
CREATE PROCEDURE `sp_GetAllStudentRequirements`()
BEGIN
    SELECT sr.*, r.name, r.is_required, r.deadline, s.student_id, s.full_name, s.student_number 
    FROM student_requirements sr 
    JOIN requirement_types r ON sr.requirement_id = r.requirement_id 
    JOIN students s ON sr.student_id = s.student_id;
END$$

DROP PROCEDURE IF EXISTS `sp_UpdateRequirementTypeStatus`$$
CREATE PROCEDURE `sp_UpdateRequirementTypeStatus`(IN p_requirement_id INT, IN p_is_required BOOLEAN)
BEGIN
    UPDATE requirement_types SET is_required = p_is_required WHERE requirement_id = p_requirement_id;
END$$

-- Staff Procedures
DROP PROCEDURE IF EXISTS `sp_GetStaffDashboardStats`$$
CREATE PROCEDURE `sp_GetStaffDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'ongoing') AS active_placements,
        (SELECT COUNT(*) FROM student_requirements WHERE status = 'pending') AS pending_requirements;
END$$

DROP PROCEDURE IF EXISTS `sp_GetStaffStudents`$$
CREATE PROCEDURE `sp_GetStaffStudents`()
BEGIN
    SELECT s.*, p.company_id, p.total_hours_rendered, p.required_hours, p.status as placement_status, c.company_name
    FROM students s
    LEFT JOIN ojt_placements p ON s.student_id = p.student_id AND p.status != 'terminated'
    LEFT JOIN companies c ON p.company_id = c.company_id;
END$$

DROP PROCEDURE IF EXISTS `sp_GetPendingRequirements`$$
CREATE PROCEDURE `sp_GetPendingRequirements`()
BEGIN
    SELECT sr.*, s.full_name, s.student_number, r.name as requirement_name 
    FROM student_requirements sr 
    JOIN students s ON sr.student_id = s.student_id 
    JOIN requirement_types r ON sr.requirement_id = r.requirement_id 
    WHERE sr.status = 'pending';
END$$

DROP PROCEDURE IF EXISTS `sp_RejectApplication`$$
CREATE PROCEDURE `sp_RejectApplication`(IN p_application_id INT)
BEGIN
    UPDATE applications SET status = 'rejected' WHERE application_id = p_application_id;
END$$

-- Student Procedures
DROP PROCEDURE IF EXISTS `sp_GetStudentRequirements`$$
CREATE PROCEDURE `sp_GetStudentRequirements`(IN p_student_id INT)
BEGIN
    SELECT r.*, sr.status as submission_status, sr.file_path, sr.submission_id, sr.remarks, sr.submitted_at 
    FROM requirement_types r 
    LEFT JOIN student_requirements sr ON r.requirement_id = sr.requirement_id AND sr.student_id = p_student_id;
END$$

DROP PROCEDURE IF EXISTS `sp_GetActivePlacementByStudentId`$$
CREATE PROCEDURE `sp_GetActivePlacementByStudentId`(IN p_student_id INT)
BEGIN
    SELECT * FROM ojt_placements WHERE student_id = p_student_id AND status != 'terminated' ORDER BY placement_id DESC LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_GetRecentAttendance`$$
CREATE PROCEDURE `sp_GetRecentAttendance`(IN p_placement_id INT)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id ORDER BY log_date DESC LIMIT 5;
END$$

DROP PROCEDURE IF EXISTS `sp_GetRecentEvaluations`$$
CREATE PROCEDURE `sp_GetRecentEvaluations`(IN p_placement_id INT)
BEGIN
    SELECT * FROM evaluations WHERE placement_id = p_placement_id ORDER BY evaluated_at DESC LIMIT 5;
END$$

DROP PROCEDURE IF EXISTS `sp_GetStudentPlacements`$$
CREATE PROCEDURE `sp_GetStudentPlacements`(IN p_student_id INT)
BEGIN
    SELECT p.*, c.company_name FROM ojt_placements p JOIN companies c ON p.company_id = c.company_id WHERE p.student_id = p_student_id;
END$$

DROP PROCEDURE IF EXISTS `sp_CheckExistingApplication`$$
CREATE PROCEDURE `sp_CheckExistingApplication`(IN p_student_id INT, IN p_company_id INT)
BEGIN
    SELECT * FROM applications WHERE student_id = p_student_id AND company_id = p_company_id;
END$$

DROP PROCEDURE IF EXISTS `sp_SubmitWeeklyReport`$$
CREATE PROCEDURE `sp_SubmitWeeklyReport`(IN p_student_id INT, IN p_week_number INT, IN p_week_start DATE, IN p_week_end DATE, IN p_tasks_completed TEXT, IN p_learnings TEXT, IN p_challenges TEXT, IN p_file_path VARCHAR(255))
BEGIN
    INSERT INTO weekly_reports (student_id, week_number, week_start_date, week_end_date, tasks_completed, learnings, challenges, attachment_url)
    VALUES (p_student_id, p_week_number, p_week_start, p_week_end, p_tasks_completed, p_learnings, p_challenges, p_file_path);
END$$

DROP PROCEDURE IF EXISTS `sp_GetWeeklyReportsByStudentId`$$
CREATE PROCEDURE `sp_GetWeeklyReportsByStudentId`(IN p_student_id INT)
BEGIN
    SELECT * FROM weekly_reports WHERE student_id = p_student_id ORDER BY week_number DESC;
END$$

DELIMITER ;
