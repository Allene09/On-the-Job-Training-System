-- OJTrack Stored Procedures Reference File (MySQL)

DELIMITER $$

CREATE PROCEDURE sp_RegisterStudent(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_student_number VARCHAR(30),
    IN p_full_name VARCHAR(150),
    IN p_gender VARCHAR(20),
    IN p_course VARCHAR(100),
    IN p_year_level VARCHAR(50)
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO users (email, password_hash, role, status, requires_password_change)
    VALUES (p_email, p_password_hash, 'student', 'pending_admin_approval', TRUE);

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO students (user_id, student_number, full_name, gender, course, year_level)
    VALUES (new_user_id, p_student_number, p_full_name, p_gender, p_course, p_year_level);
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
    IN p_user_id INT
)
BEGIN
    UPDATE users
    SET status = 'active'
    WHERE user_id = p_user_id;
END$$

DELIMITER ;
