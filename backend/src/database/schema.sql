-- OJTrack Database Schema (MySQL)
-- Reference file matching System Design Document (v1)

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student','staff','admin') NOT NULL,
    status ENUM('active','inactive','pending','pending_admin_approval') DEFAULT 'pending',
    requires_password_change BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20),
    course VARCHAR(100),
    year_level VARCHAR(50),
    contact_number VARCHAR(20),
    address VARCHAR(255),
    required_hours INT DEFAULT 486,
    profile_photo VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(30) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    contact_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    address VARCHAR(255),
    contact_person VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(150),
    slots_available INT DEFAULT 0,
    photo_url VARCHAR(255),
    requirements TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    added_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(user_id)
);

CREATE TABLE requirement_types (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    is_required BOOLEAN DEFAULT TRUE,
    deadline DATE
);

CREATE TABLE student_requirements (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    requirement_id INT NOT NULL,
    file_path VARCHAR(255),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    remarks VARCHAR(255),
    reviewed_by INT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES requirement_types(requirement_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

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

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    posted_by INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(user_id)
);
