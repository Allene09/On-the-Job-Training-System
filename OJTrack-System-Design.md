# OJTrack — On-the-Job Training Monitoring System
### System Design Document (v1)

---

## 1. System Overview

**Proposed Name:** OJTrack (On-the-Job Training Tracking & Monitoring System)
*(Alternatives: OJT-Connect, InternHub, PraxisTrack — pick whichever fits your school branding)*

**Purpose:** Digitize the OJT workflow — from requirement submission, to company application, to attendance/hours monitoring, to final evaluation — for students, OJT coordinators (staff), and administrators.

### Roles

| Role | Description |
|---|---|
| **Student (User)** | Applies for OJT, submits requirements, logs attendance/DTR, submits weekly reports, views progress |
| **Staff (OJT Coordinator)** | Reviews/approves requirements, approves company applications, monitors attendance, evaluates students |
| **Admin** | Manages users, manages partner companies, oversees system-wide reports, configures requirements/deadlines |

---

## 2. Input – Process – Output (IPO) Model

### INPUT
- Student registration & profile details
- Requirement documents (resume, endorsement letter, MOA, parental consent, medical certificate, insurance, etc.)
- Partner company / Host Training Establishment (HTE) details
- Daily Time Record (time-in / time-out)
- Weekly narrative reports
- Evaluation criteria & scores (from company supervisor or coordinator)

### PROCESS
- Account registration & role-based authentication
- Requirement submission → staff review → approve/reject
- Student applies to a company → staff/admin approves placement
- MOA generation/tracking between school and company
- Daily attendance logging → automatic hours computation
- Weekly report submission & review
- Progress computation (hours rendered vs. required hours)
- Evaluation scoring & grade computation
- Notifications for deadlines, approvals, rejections

### OUTPUT
- Approved OJT placement record
- Requirement compliance status (checklist)
- DTR/attendance reports
- Progress dashboard (% of required hours completed)
- Evaluation results & final grade
- Certificate of completion
- Admin analytics (per course, per company, completion rates)

---

## 3. Database Schema (Tables)

> Written in MySQL syntax. Naming uses `snake_case`; every table has an auto-increment PK and timestamps.

```sql
-- ============================================
-- 1. USERS (base auth table for all 3 roles)
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student','staff','admin') NOT NULL,
    status ENUM('active','inactive','pending') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. STUDENTS
-- ============================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    course VARCHAR(100),
    year_level VARCHAR(20),
    contact_number VARCHAR(20),
    address VARCHAR(255),
    required_hours INT DEFAULT 486, -- adjust to your school's required OJT hours
    profile_photo VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 3. STAFF (OJT Coordinators)
-- ============================================
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(30) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    contact_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 4. ADMINS
-- ============================================
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 5. COMPANIES (Host Training Establishments)
-- ============================================
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    address VARCHAR(255),
    contact_person VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(150),
    slots_available INT DEFAULT 0,
    status ENUM('active','inactive') DEFAULT 'active',
    added_by INT, -- staff/admin who added it
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(user_id)
);

-- ============================================
-- 6. REQUIREMENT TYPES (configurable by admin/staff)
-- ============================================
CREATE TABLE requirement_types (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,       -- e.g. "Resume", "Parent Consent"
    description VARCHAR(255),
    is_required BOOLEAN DEFAULT TRUE,
    deadline DATE
);

-- ============================================
-- 7. STUDENT REQUIREMENT SUBMISSIONS
-- ============================================
CREATE TABLE student_requirements (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    requirement_id INT NOT NULL,
    file_path VARCHAR(255),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    remarks VARCHAR(255),
    reviewed_by INT, -- staff user_id
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES requirement_types(requirement_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- ============================================
-- 8. APPLICATIONS (student applying to a company)
-- ============================================
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- ============================================
-- 9. OJT PLACEMENTS (once accepted, becomes an active placement)
-- ============================================
CREATE TABLE ojt_placements (
    placement_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    required_hours INT DEFAULT 486,
    total_hours_rendered DECIMAL(6,2) DEFAULT 0,
    status ENUM('ongoing','completed','terminated') DEFAULT 'ongoing',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- ============================================
-- 10. ATTENDANCE / DAILY TIME RECORD (DTR)
-- ============================================
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    placement_id INT NOT NULL,
    log_date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    hours_rendered DECIMAL(4,2) DEFAULT 0,
    status ENUM('present','absent','late','excused') DEFAULT 'present',
    remarks VARCHAR(255),
    FOREIGN KEY (placement_id) REFERENCES ojt_placements(placement_id) ON DELETE CASCADE
);

-- ============================================
-- 11. WEEKLY NARRATIVE REPORTS
-- ============================================
CREATE TABLE weekly_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    placement_id INT NOT NULL,
    week_number INT,
    narrative TEXT,
    status ENUM('submitted','reviewed') DEFAULT 'submitted',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT,
    FOREIGN KEY (placement_id) REFERENCES ojt_placements(placement_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- ============================================
-- 12. EVALUATIONS
-- ============================================
CREATE TABLE evaluations (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    placement_id INT NOT NULL,
    evaluator_name VARCHAR(150),
    attendance_score DECIMAL(4,2),
    work_quality_score DECIMAL(4,2),
    attitude_score DECIMAL(4,2),
    total_score DECIMAL(5,2),
    remarks VARCHAR(255),
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (placement_id) REFERENCES ojt_placements(placement_id) ON DELETE CASCADE
);

-- ============================================
-- 13. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 14. ANNOUNCEMENTS (posted by staff/admin)
-- ============================================
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    posted_by INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(user_id)
);
```

---

## 4. Stored Procedures

```sql
DELIMITER $$

-- ============================================
-- Register a new student account
-- ============================================
CREATE PROCEDURE sp_RegisterStudent(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_student_number VARCHAR(30),
    IN p_full_name VARCHAR(150),
    IN p_course VARCHAR(100),
    IN p_year_level VARCHAR(20)
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO users (email, password_hash, role, status)
    VALUES (p_email, p_password_hash, 'student', 'pending');

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO students (user_id, student_number, full_name, course, year_level)
    VALUES (new_user_id, p_student_number, p_full_name, p_course, p_year_level);
END$$

-- ============================================
-- Submit a requirement (student uploads file)
-- ============================================
CREATE PROCEDURE sp_SubmitRequirement(
    IN p_student_id INT,
    IN p_requirement_id INT,
    IN p_file_path VARCHAR(255)
)
BEGIN
    INSERT INTO student_requirements (student_id, requirement_id, file_path, status)
    VALUES (p_student_id, p_requirement_id, p_file_path, 'pending');
END$$

-- ============================================
-- Staff reviews (approve/reject) a requirement
-- ============================================
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

-- ============================================
-- Student applies to a company
-- ============================================
CREATE PROCEDURE sp_ApplyToCompany(
    IN p_student_id INT,
    IN p_company_id INT
)
BEGIN
    INSERT INTO applications (student_id, company_id, status)
    VALUES (p_student_id, p_company_id, 'pending');
END$$

-- ============================================
-- Staff/Admin approves an application -> creates OJT placement
-- ============================================
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

-- ============================================
-- Record daily attendance (time-in/time-out) and auto-compute hours
-- ============================================
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

-- ============================================
-- Get a student's progress (% of hours completed)
-- ============================================
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

-- ============================================
-- Submit an evaluation and compute total score
-- ============================================
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

-- ============================================
-- Mark placement complete once required hours are met
-- ============================================
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

DELIMITER ;
```

---

## 5. Project Directory Structure

```
ojtrack/
│
├── Backend/                          # Node.js + Express (JavaScript)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MySQL connection pool
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── staffController.js
│   │   │   ├── adminController.js
│   │   │   ├── companyController.js
│   │   │   ├── requirementController.js
│   │   │   ├── applicationController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── evaluationController.js
│   │   │   └── notificationController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── staffRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── requirementRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   └── evaluationRoutes.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # verify JWT
│   │   │   ├── roleMiddleware.js      # restrict by role (student/staff/admin)
│   │   │   └── uploadMiddleware.js    # multer file uploads
│   │   │
│   │   ├── services/                  # business logic / calls stored procs
│   │   │   ├── authService.js
│   │   │   ├── requirementService.js
│   │   │   ├── attendanceService.js
│   │   │   └── evaluationService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── responseHandler.js
│   │   │
│   │   └── app.js                     # Express app setup
│   │
│   ├── uploads/                       # uploaded requirement files
│   ├── database/
│   │   ├── schema.sql                 # tables (Section 3 above)
│   │   └── procedures.sql             # stored procedures (Section 4 above)
│   ├── .env
│   ├── server.js                      # entry point
│   └── package.json
│
└── Frontend/                          # React Native (JavaScript)
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.js
    │   │   ├── authApi.js
    │   │   ├── studentApi.js
    │   │   ├── staffApi.js
    │   │   └── adminApi.js
    │   │
    │   ├── assets/
    │   │   ├── images/
    │   │   └── icons/
    │   │
    │   ├── components/
    │   │   ├── common/                # buttons, inputs, cards, modals
    │   │   ├── StudentCard.js
    │   │   ├── ProgressBar.js
    │   │   └── RequirementItem.js
    │   │
    │   ├── context/
    │   │   └── AuthContext.js         # stores logged-in user & role
    │   │
    │   ├── navigation/
    │   │   ├── AppNavigator.js
    │   │   ├── StudentNavigator.js
    │   │   ├── StaffNavigator.js
    │   │   └── AdminNavigator.js
    │   │
    │   ├── screens/
    │   │   ├── Auth/
    │   │   │   ├── LoginScreen.js
    │   │   │   └── RegisterScreen.js
    │   │   │
    │   │   ├── Student/
    │   │   │   ├── DashboardScreen.js
    │   │   │   ├── RequirementsScreen.js
    │   │   │   ├── CompanyListScreen.js
    │   │   │   ├── AttendanceScreen.js
    │   │   │   ├── WeeklyReportScreen.js
    │   │   │   └── ProgressScreen.js
    │   │   │
    │   │   ├── Staff/
    │   │   │   ├── DashboardScreen.js
    │   │   │   ├── ReviewRequirementsScreen.js
    │   │   │   ├── ApplicationsScreen.js
    │   │   │   ├── AttendanceMonitorScreen.js
    │   │   │   └── EvaluationScreen.js
    │   │   │
    │   │   └── Admin/
    │   │       ├── DashboardScreen.js
    │   │       ├── ManageUsersScreen.js
    │   │       ├── ManageCompaniesScreen.js
    │   │       ├── ManageRequirementsScreen.js
    │   │       └── ReportsScreen.js
    │   │
    │   └── utils/
    │       ├── validators.js
    │       └── constants.js
    │
    ├── App.js
    ├── app.json
    ├── babel.config.js
    └── package.json
```

---

## 6. Suggested Next Steps
1. Confirm the system name and your school's exact OJT hour requirement / required documents.
2. I can scaffold the actual folders + starter files (package.json, server.js, App.js, DB connection, sample controller/route) so you have a running skeleton.
3. After that: build auth (JWT + role-based routing) first, since every other feature depends on it.
