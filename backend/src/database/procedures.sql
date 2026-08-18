-- OJTrack Stored Procedures Reference File (MySQL)
-- Derived from backend/Ojt backup.sql and aligned with the current app

DELIMITER $$

CREATE PROCEDURE sp_RegisterStudent(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_plain_password VARCHAR(255),
    IN p_student_number VARCHAR(30),
    IN p_full_name VARCHAR(150),
    IN p_first_name VARCHAR(50),
    IN p_middle_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_gender VARCHAR(20),
    IN p_course VARCHAR(100),
    IN p_year_level VARCHAR(50)
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO users (email, password_hash, plain_password, role, status, requires_password_change)
    VALUES (p_email, p_password_hash, p_plain_password, 'student', 'pending_admin_approval', TRUE);

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO students (user_id, student_number, full_name, first_name, middle_name, last_name, gender, course, year_level)
    VALUES (new_user_id, p_student_number, p_full_name, p_first_name, p_middle_name, p_last_name, p_gender, p_course, p_year_level);
END$$

CREATE PROCEDURE sp_SubmitRequirement(
    IN p_student_id INT,
    IN p_requirement_id INT,
    IN p_file_path VARCHAR(255)
)
BEGIN
    INSERT INTO student_requirements (student_id, requirement_id, file_path, status)
    VALUES (p_student_id, p_requirement_id, p_file_path, 'pending');
END$$

CREATE PROCEDURE sp_ReviewRequirement(
    IN p_submission_id INT,
    IN p_status ENUM('approved','rejected'),
    IN p_remarks VARCHAR(255),
    IN p_reviewed_by INT
)
BEGIN
    UPDATE student_requirements
    SET status = p_status,
        remarks = p_remarks,
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW()
    WHERE submission_id = p_submission_id;
END$$

CREATE PROCEDURE sp_ApplyToCompany(
    IN p_student_id INT,
    IN p_company_id INT
)
BEGIN
    INSERT INTO applications (student_id, company_id, status)
    VALUES (p_student_id, p_company_id, 'pending');
END$$

CREATE PROCEDURE sp_ApproveApplication(
    IN p_application_id INT,
    IN p_approved_by INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_required_hours INT
)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_company_id INT;

    SELECT student_id, company_id INTO v_student_id, v_company_id
    FROM applications WHERE application_id = p_application_id;

    UPDATE applications
    SET status = 'accepted', approved_by = p_approved_by, approved_at = NOW()
    WHERE application_id = p_application_id;

    INSERT INTO ojt_placements (student_id, company_id, start_date, end_date, required_hours)
    VALUES (v_student_id, v_company_id, p_start_date, p_end_date, p_required_hours);

    UPDATE companies
    SET slots_available = slots_available - 1
    WHERE company_id = v_company_id AND slots_available > 0;
END$$

CREATE PROCEDURE sp_RecordAttendance(
    IN p_placement_id INT,
    IN p_log_date DATE,
    IN p_time_in TIME,
    IN p_time_out TIME
)
BEGIN
    DECLARE v_hours DECIMAL(4,2);
    SET v_hours = TIMESTAMPDIFF(MINUTE, p_time_in, p_time_out) / 60.0;

    INSERT INTO attendance (placement_id, log_date, time_in, time_out, hours_rendered, status)
    VALUES (p_placement_id, p_log_date, p_time_in, p_time_out, v_hours, 'present');

    UPDATE ojt_placements
    SET total_hours_rendered = total_hours_rendered + v_hours
    WHERE placement_id = p_placement_id;
END$$

CREATE PROCEDURE sp_GetStudentProgress(
    IN p_placement_id INT
)
BEGIN
    SELECT
        placement_id,
        required_hours,
        total_hours_rendered,
        ROUND((total_hours_rendered / required_hours) * 100, 2) AS progress_percent,
        status
    FROM ojt_placements
    WHERE placement_id = p_placement_id;
END$$

CREATE PROCEDURE sp_SubmitEvaluation(
    IN p_placement_id INT,
    IN p_evaluator_name VARCHAR(150),
    IN p_attendance_score DECIMAL(4,2),
    IN p_work_quality_score DECIMAL(4,2),
    IN p_attitude_score DECIMAL(4,2),
    IN p_remarks VARCHAR(255)
)
BEGIN
    DECLARE v_total DECIMAL(5,2);
    SET v_total = p_attendance_score + p_work_quality_score + p_attitude_score;

    INSERT INTO evaluations (
        placement_id, evaluator_name, attendance_score,
        work_quality_score, attitude_score, total_score, remarks
    )
    VALUES (
        p_placement_id, p_evaluator_name, p_attendance_score,
        p_work_quality_score, p_attitude_score, v_total, p_remarks
    );
END$$

CREATE PROCEDURE sp_CheckAndCompletePlacement(
    IN p_placement_id INT
)
BEGIN
    DECLARE v_required INT;
    DECLARE v_rendered DECIMAL(6,2);

    SELECT required_hours, total_hours_rendered
    INTO v_required, v_rendered
    FROM ojt_placements WHERE placement_id = p_placement_id;

    IF v_rendered >= v_required THEN
        UPDATE ojt_placements SET status = 'completed' WHERE placement_id = p_placement_id;
    END IF;
END$$

CREATE PROCEDURE sp_ApproveStudentAccount(
    IN p_user_id INT,
    IN p_password_hash VARCHAR(255),
    IN p_plain_password VARCHAR(255)
)
BEGIN
    UPDATE users
    SET status = 'active',
        password_hash = p_password_hash,
        plain_password = p_plain_password
    WHERE user_id = p_user_id;
END$$

CREATE PROCEDURE sp_UpdateUserStatus(
    IN p_user_id INT,
    IN p_status ENUM('active', 'inactive', 'pending', 'pending_admin_approval')
)
BEGIN
    UPDATE users
    SET status = p_status
    WHERE user_id = p_user_id;
END$$

CREATE PROCEDURE sp_ChangeUserPassword(
    IN p_user_id INT,
    IN p_new_password VARCHAR(255),
    IN p_plain_password VARCHAR(255)
)
BEGIN
    UPDATE users
    SET password_hash = p_new_password,
        plain_password = p_plain_password,
        requires_password_change = 0
    WHERE user_id = p_user_id;
END$$

CREATE PROCEDURE sp_RegisterStaff(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_plain_password VARCHAR(255),
    IN p_full_name VARCHAR(150),
    IN p_first_name VARCHAR(50),
    IN p_middle_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_employee_id VARCHAR(30),
    IN p_department VARCHAR(100)
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO users (email, password_hash, plain_password, role, status, requires_password_change)
    VALUES (p_email, p_password_hash, p_plain_password, 'staff', 'active', FALSE);

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO staff (user_id, employee_id, full_name, first_name, middle_name, last_name, department)
    VALUES (new_user_id, p_employee_id, p_full_name, p_first_name, p_middle_name, p_last_name, p_department);
END$$

CREATE PROCEDURE sp_UpdateUserProfile(
    IN p_user_id INT,
    IN p_role ENUM('student','staff','admin'),
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_plain_password VARCHAR(255),
    IN p_full_name VARCHAR(150),
    IN p_first_name VARCHAR(50),
    IN p_middle_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_student_number VARCHAR(30),
    IN p_course VARCHAR(100),
    IN p_year_level VARCHAR(50),
    IN p_gender VARCHAR(20),
    IN p_employee_id VARCHAR(30),
    IN p_department VARCHAR(100),
    IN p_contact_number VARCHAR(20),
    IN p_address VARCHAR(255)
)
BEGIN
    UPDATE users
    SET email = p_email,
        password_hash = CASE
            WHEN p_password_hash IS NULL OR p_password_hash = '' THEN password_hash
            ELSE p_password_hash
        END,
        plain_password = CASE
            WHEN p_plain_password IS NULL OR p_plain_password = '' THEN plain_password
            ELSE p_plain_password
        END,
        requires_password_change = 0
    WHERE user_id = p_user_id;

    IF p_role = 'student' THEN
        UPDATE students
        SET full_name = p_full_name,
            first_name = p_first_name,
            middle_name = p_middle_name,
            last_name = p_last_name,
            student_number = COALESCE(NULLIF(p_student_number, ''), student_number),
            course = p_course,
            year_level = p_year_level,
            gender = p_gender,
            contact_number = COALESCE(NULLIF(p_contact_number, ''), contact_number),
            address = COALESCE(NULLIF(p_address, ''), address)
        WHERE user_id = p_user_id;
    ELSEIF p_role = 'staff' THEN
        UPDATE staff
        SET full_name = p_full_name,
            first_name = p_first_name,
            middle_name = p_middle_name,
            last_name = p_last_name,
            employee_id = COALESCE(NULLIF(p_employee_id, ''), employee_id),
            department = p_department,
            contact_number = COALESCE(NULLIF(p_contact_number, ''), contact_number)
        WHERE user_id = p_user_id;
    ELSEIF p_role = 'admin' THEN
        UPDATE admins
        SET full_name = p_full_name,
            first_name = p_first_name,
            middle_name = p_middle_name,
            last_name = p_last_name
        WHERE user_id = p_user_id;
    END IF;
END$$

CREATE PROCEDURE sp_SearchUsers(IN p_role VARCHAR(50), IN p_status VARCHAR(50))
BEGIN
    SELECT u.*, 
        s.full_name AS student_name, s.first_name AS student_first_name, s.middle_name AS student_middle_name, s.last_name AS student_last_name, s.student_number, s.course, s.year_level, s.gender, s.contact_number AS student_contact, s.address AS student_address,
        st.full_name AS staff_name, st.first_name AS staff_first_name, st.middle_name AS staff_middle_name, st.last_name AS staff_last_name, st.employee_id, st.department, st.contact_number AS staff_contact,
        a.full_name AS admin_name, a.first_name AS admin_first_name, a.middle_name AS admin_middle_name, a.last_name AS admin_last_name
    FROM users u
    LEFT JOIN students s ON u.user_id = s.user_id
    LEFT JOIN staff st ON u.user_id = st.user_id
    LEFT JOIN admins a ON u.user_id = a.user_id
    WHERE (p_role IS NULL OR p_role = '' OR u.role = p_role)
      AND (p_status IS NULL OR p_status = '' OR u.status = p_status)
    ORDER BY u.created_at DESC;
END$$

DELIMITER ;
