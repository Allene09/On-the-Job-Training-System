/*
SQLyog Ultimate v9.62 
MySQL - 5.7.43-log : Database - ojt
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ojt` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `ojt`;

/*Table structure for table `admins` */

DROP TABLE IF EXISTS `admins`;

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `admins` */

insert  into `admins`(`admin_id`,`user_id`,`full_name`) values (1,1,'Mark Allene Cayda');

/*Table structure for table `announcements` */

DROP TABLE IF EXISTS `announcements`;

CREATE TABLE `announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `posted_by` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`announcement_id`),
  KEY `posted_by` (`posted_by`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `announcements` */

/*Table structure for table `applications` */

DROP TABLE IF EXISTS `applications`;

CREATE TABLE `applications` (
  `application_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `applied_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  KEY `student_id` (`student_id`),
  KEY `company_id` (`company_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `applications` */

insert  into `applications`(`application_id`,`student_id`,`company_id`,`status`,`applied_at`,`approved_by`,`approved_at`) values (1,3,1,'accepted','2026-08-01 15:01:05',5,'2026-08-01 15:02:00');

/*Table structure for table `attendance` */

DROP TABLE IF EXISTS `attendance`;

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL AUTO_INCREMENT,
  `placement_id` int(11) NOT NULL,
  `log_date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `hours_rendered` decimal(4,2) DEFAULT '0.00',
  `status` enum('present','absent','late','excused') DEFAULT 'present',
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`attendance_id`),
  KEY `placement_id` (`placement_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `ojt_placements` (`placement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `attendance` */

/*Table structure for table `companies` */

DROP TABLE IF EXISTS `companies`;

CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `slots_available` int(11) DEFAULT '0',
  `photo_url` varchar(255) DEFAULT NULL,
  `requirements` text,
  `status` enum('active','inactive') DEFAULT 'active',
  `added_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`),
  KEY `added_by` (`added_by`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `companies` */

insert  into `companies`(`company_id`,`company_name`,`industry`,`address`,`contact_person`,`contact_number`,`email`,`slots_available`,`photo_url`,`requirements`,`status`,`added_by`,`created_at`) values (1,'Provincial Government Bohol','BICTO','4th Floor, New Provincial Capitol Complex Lino Chatto Drive, Cogon District, Tagbilaran City, Bohol 6300 Philippines','038.411.0138','','bictu.innovation@gmail.com',3,NULL,NULL,'active',1,'2026-08-01 13:14:04');

/*Table structure for table `evaluations` */

DROP TABLE IF EXISTS `evaluations`;

CREATE TABLE `evaluations` (
  `evaluation_id` int(11) NOT NULL AUTO_INCREMENT,
  `placement_id` int(11) NOT NULL,
  `evaluator_name` varchar(150) DEFAULT NULL,
  `attendance_score` decimal(4,2) DEFAULT NULL,
  `work_quality_score` decimal(4,2) DEFAULT NULL,
  `attitude_score` decimal(4,2) DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `evaluated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evaluation_id`),
  KEY `placement_id` (`placement_id`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `ojt_placements` (`placement_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `evaluations` */

insert  into `evaluations`(`evaluation_id`,`placement_id`,`evaluator_name`,`attendance_score`,`work_quality_score`,`attitude_score`,`total_score`,`remarks`,`evaluated_at`) values (1,1,'Prof. Alejandro Rivera','75.00','75.00','76.00','226.00','Goods','2026-08-03 19:24:11');

/*Table structure for table `notifications` */

DROP TABLE IF EXISTS `notifications`;

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `notifications` */

/*Table structure for table `ojt_placements` */

DROP TABLE IF EXISTS `ojt_placements`;

CREATE TABLE `ojt_placements` (
  `placement_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `required_hours` int(11) DEFAULT '486',
  `total_hours_rendered` decimal(6,2) DEFAULT '0.00',
  `status` enum('ongoing','completed','terminated') DEFAULT 'ongoing',
  PRIMARY KEY (`placement_id`),
  KEY `student_id` (`student_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `ojt_placements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `ojt_placements_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `ojt_placements` */

insert  into `ojt_placements`(`placement_id`,`student_id`,`company_id`,`start_date`,`end_date`,`required_hours`,`total_hours_rendered`,`status`) values (1,3,1,'2026-08-01','2026-11-30',486,'0.00','ongoing'),(2,3,1,'2026-08-01','2026-11-30',486,'0.00','ongoing');

/*Table structure for table `requirement_types` */

DROP TABLE IF EXISTS `requirement_types`;

CREATE TABLE `requirement_types` (
  `requirement_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  `deadline` date DEFAULT NULL,
  PRIMARY KEY (`requirement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `requirement_types` */

insert  into `requirement_types`(`requirement_id`,`name`,`description`,`is_required`,`deadline`) values (1,'Resume','HEHE',1,'2026-08-31'),(2,'Rsume','Valid',1,'2026-08-26');

/*Table structure for table `staff` */

DROP TABLE IF EXISTS `staff`;

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(30) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `staff` */

insert  into `staff`(`staff_id`,`user_id`,`employee_id`,`full_name`,`department`,`contact_number`) values (1,5,'5','Mark Allene CAyda','ctech',NULL);

/*Table structure for table `student_requirements` */

DROP TABLE IF EXISTS `student_requirements`;

CREATE TABLE `student_requirements` (
  `submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `requirement_id` int(11) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `remarks` varchar(255) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`submission_id`),
  KEY `student_id` (`student_id`),
  KEY `requirement_id` (`requirement_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `student_requirements_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `student_requirements_ibfk_2` FOREIGN KEY (`requirement_id`) REFERENCES `requirement_types` (`requirement_id`),
  CONSTRAINT `student_requirements_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `student_requirements` */

insert  into `student_requirements`(`submission_id`,`student_id`,`requirement_id`,`file_path`,`status`,`remarks`,`reviewed_by`,`submitted_at`,`reviewed_at`) values (1,3,1,'/uploads/doc_1785761279971.pdf','pending',NULL,NULL,'2026-08-03 20:48:00',NULL),(2,3,1,'/uploads/doc_1785761404206.pdf','pending',NULL,NULL,'2026-08-03 20:50:04',NULL),(3,3,1,'/uploads/doc_1785761448054.pdf','pending',NULL,NULL,'2026-08-03 20:50:48',NULL);

/*Table structure for table `students` */

DROP TABLE IF EXISTS `students`;

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `student_number` varchar(30) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `year_level` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `required_hours` int(11) DEFAULT '486',
  `profile_photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_number` (`student_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Data for the table `students` */

insert  into `students`(`student_id`,`user_id`,`student_number`,`full_name`,`first_name`,`middle_name`,`last_name`,`gender`,`course`,`year_level`,`contact_number`,`address`,`required_hours`,`profile_photo`) values (1,2,'2026-00001','Mark Allene Cayda',NULL,NULL,NULL,'Male','BS Computer Science','4th Year','09123456789','Zamora, Bilar',486,NULL),(2,4,'SN-1785501194123','Kevin  Esto',NULL,NULL,NULL,'Male','BSCS','4-B',NULL,NULL,486,NULL),(3,6,'SN-1785560802545','James  Ronolo',NULL,NULL,NULL,'Male','BSCS','3B',NULL,NULL,486,NULL),(4,7,'SN-1785761032609','Zach  Lumantas',NULL,NULL,NULL,'Male','BSCS','4B',NULL,NULL,486,NULL);

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','staff','admin') NOT NULL,
  `status` enum('active','inactive','pending','pending_admin_approval') DEFAULT 'pending',
  `requires_password_change` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Data for the table `users` */

insert  into `users`(`user_id`,`email`,`password_hash`,`role`,`status`,`requires_password_change`,`created_at`,`updated_at`) values (1,'Admin@gmail.com','Admin123','admin','active',0,'2026-07-31 19:18:46','2026-07-31 19:18:46'),(2,'markallene.cayda@bisu.edu.ph','Allene12345','student','active',0,'2026-07-31 20:19:01','2026-07-31 20:21:31'),(3,'staff@gmail.com','staff12345','staff','active',0,'2026-07-31 20:19:01','2026-08-01 12:42:25'),(4,'Kevin@gmail.com','Kevin123','student','active',0,'2026-07-31 20:33:14','2026-07-31 20:34:14'),(5,'Allene@gmail.com','allene123','staff','active',0,'2026-08-01 12:45:21','2026-08-01 12:45:21'),(6,'jamesronolo@gmail.com','jamesronolo123','student','active',0,'2026-08-01 13:06:42','2026-08-01 13:07:47'),(7,'zachlumantas@gmail.com','zachlumantas123','student','pending_admin_approval',1,'2026-08-03 20:43:52','2026-08-03 20:43:52');

/*Table structure for table `weekly_reports` */

DROP TABLE IF EXISTS `weekly_reports`;

CREATE TABLE `weekly_reports` (
  `report_id` int(11) NOT NULL AUTO_INCREMENT,
  `placement_id` int(11) NOT NULL,
  `week_number` int(11) DEFAULT NULL,
  `narrative` text,
  `status` enum('submitted','reviewed') DEFAULT 'submitted',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `placement_id` (`placement_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `weekly_reports_ibfk_1` FOREIGN KEY (`placement_id`) REFERENCES `ojt_placements` (`placement_id`) ON DELETE CASCADE,
  CONSTRAINT `weekly_reports_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `weekly_reports` */

/* Procedure structure for procedure `sp_AddCompany` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_AddCompany` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_AddCompany`(
    IN p_company_name VARCHAR(150), IN p_industry VARCHAR(100), IN p_address VARCHAR(255), 
    IN p_contact_person VARCHAR(100), IN p_contact_number VARCHAR(20), IN p_email VARCHAR(150), 
    IN p_slots_available INT, IN p_photo_url VARCHAR(255), IN p_requirements TEXT, IN p_added_by INT
)
BEGIN
    INSERT INTO companies (company_name, industry, address, contact_person, contact_number, email, slots_available, photo_url, requirements, added_by)
    VALUES (p_company_name, p_industry, p_address, p_contact_person, p_contact_number, p_email, p_slots_available, p_photo_url, p_requirements, p_added_by);
    SELECT LAST_INSERT_ID() AS company_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ApplyToCompany` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ApplyToCompany` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ApplyToCompany`(
    IN p_student_id INT,
    IN p_company_id INT
)
BEGIN
    INSERT INTO applications (student_id, company_id, status)
    VALUES (p_student_id, p_company_id, 'pending');
    
    UPDATE companies 
    SET slots_available = slots_available - 1 
    WHERE company_id = p_company_id AND slots_available > 0;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ApproveAccount` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ApproveAccount` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ApproveAccount`(IN p_user_id INT)
BEGIN
    UPDATE users SET status = 'active' WHERE user_id = p_user_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ApproveApplication` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ApproveApplication` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ApproveApplication`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ApproveStudentAccount` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ApproveStudentAccount` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ApproveStudentAccount`(
    IN p_user_id INT,
    IN p_password_hash VARCHAR(255)
)
BEGIN
    UPDATE users
    SET status = 'active', password_hash = p_password_hash
    WHERE user_id = p_user_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ChangeUserPassword` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ChangeUserPassword` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ChangeUserPassword`(IN p_user_id INT, IN p_new_password VARCHAR(255))
BEGIN
    UPDATE users SET password_hash = p_new_password, requires_password_change = 0 WHERE user_id = p_user_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_CheckAndCompletePlacement` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_CheckAndCompletePlacement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_CheckAndCompletePlacement`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_CheckExistingApplication` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_CheckExistingApplication` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_CheckExistingApplication`(IN p_student_id INT, IN p_company_id INT)
BEGIN
    SELECT * FROM applications WHERE student_id = p_student_id AND company_id = p_company_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_CreateAnnouncement` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_CreateAnnouncement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_CreateAnnouncement`(IN p_posted_by INT, IN p_title VARCHAR(150), IN p_content TEXT)
BEGIN
    INSERT INTO announcements (posted_by, title, content) VALUES (p_posted_by, p_title, p_content);
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetActivePlacementByStudentId` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetActivePlacementByStudentId` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetActivePlacementByStudentId`(IN p_student_id INT)
BEGIN
    SELECT * FROM ojt_placements WHERE student_id = p_student_id AND status != 'terminated' ORDER BY placement_id DESC LIMIT 1;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAdminDashboardStats` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAdminDashboardStats` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAdminDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'completed') AS completed_placements,
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'ongoing') AS ongoing_placements,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM staff) AS total_staff,
        (SELECT COUNT(*) FROM companies) AS total_companies,
        (SELECT COUNT(*) FROM companies WHERE status = 'active') AS active_companies,
        (SELECT SUM(hours_rendered) FROM attendance) AS total_hours_rendered;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAllApplications` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAllApplications` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAllApplications`()
BEGIN
    SELECT a.*, s.full_name, s.course, s.year_level, s.student_number, c.company_name
    FROM applications a
    JOIN students s ON a.student_id = s.student_id
    JOIN companies c ON a.company_id = c.company_id
    ORDER BY a.applied_at DESC;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAllCompanies` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAllCompanies` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAllCompanies`()
BEGIN
    SELECT * FROM companies;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAllStudentRequirements` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAllStudentRequirements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAllStudentRequirements`()
BEGIN
    SELECT sr.*, r.name, r.is_required, r.deadline, s.student_id, s.full_name, s.student_number 
    FROM student_requirements sr 
    JOIN requirement_types r ON sr.requirement_id = r.requirement_id 
    JOIN students s ON sr.student_id = s.student_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAllUsers` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAllUsers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAllUsers`()
BEGIN
    SELECT * FROM users;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAnnouncements` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAnnouncements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAnnouncements`()
BEGIN
    SELECT * FROM announcements ORDER BY created_at DESC;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetAttendanceByPlacementId` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetAttendanceByPlacementId` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetAttendanceByPlacementId`(IN p_placement_id INT)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetEvaluationsByPlacementId` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetEvaluationsByPlacementId` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetEvaluationsByPlacementId`(IN p_placement_id INT)
BEGIN
    SELECT * FROM evaluations WHERE placement_id = p_placement_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetLatestAttendanceRecord` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetLatestAttendanceRecord` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetLatestAttendanceRecord`(IN p_placement_id INT, IN p_log_date DATE)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id AND log_date = p_log_date ORDER BY attendance_id DESC LIMIT 1;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetPendingAccounts` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetPendingAccounts` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetPendingAccounts`()
BEGIN
    SELECT u.user_id, u.email, u.role, u.status, u.created_at, s.student_number, s.full_name, s.course, s.year_level, s.first_name, s.last_name
    FROM users u
    JOIN students s ON u.user_id = s.user_id
    WHERE u.status = 'pending_admin_approval';
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RejectStudentAccount` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RejectStudentAccount` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RejectStudentAccount`(
    IN p_user_id INT
)
BEGIN
    UPDATE users
    SET status = 'inactive'
    WHERE user_id = p_user_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetPendingRequirements` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetPendingRequirements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetPendingRequirements`()
BEGIN
    SELECT sr.*, s.full_name, s.student_number, r.name as requirement_name 
    FROM student_requirements sr 
    JOIN students s ON sr.student_id = s.student_id 
    JOIN requirement_types r ON sr.requirement_id = r.requirement_id 
    WHERE sr.status = 'pending';
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetPlacementStats` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetPlacementStats` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetPlacementStats`(IN p_placement_id INT)
BEGIN
    SELECT required_hours, total_hours_rendered, status FROM ojt_placements WHERE placement_id = p_placement_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetRecentAttendance` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetRecentAttendance` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetRecentAttendance`(IN p_placement_id INT)
BEGIN
    SELECT * FROM attendance WHERE placement_id = p_placement_id ORDER BY log_date DESC LIMIT 5;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetRecentEvaluations` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetRecentEvaluations` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetRecentEvaluations`(IN p_placement_id INT)
BEGIN
    SELECT * FROM evaluations WHERE placement_id = p_placement_id ORDER BY evaluated_at DESC LIMIT 5;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetRequirementTypes` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetRequirementTypes` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetRequirementTypes`()
BEGIN
    SELECT * FROM requirement_types;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetStaffDashboardStats` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetStaffDashboardStats` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetStaffDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'ongoing') AS active_placements,
        (SELECT COUNT(*) FROM student_requirements WHERE status = 'pending') AS pending_requirements;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetStaffStudents` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetStaffStudents` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetStaffStudents`()
BEGIN
    SELECT s.*, u.email, u.status as account_status,
           p.placement_id as active_placement_id,
           p.status as active_placement_status,
           p.company_id, p.total_hours_rendered, p.required_hours, c.company_name
    FROM students s
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN ojt_placements p ON s.student_id = p.student_id AND p.status = 'ongoing'
    LEFT JOIN companies c ON p.company_id = c.company_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetStudentPlacements` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetStudentPlacements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetStudentPlacements`(IN p_student_id INT)
BEGIN
    SELECT p.*, c.company_name FROM ojt_placements p JOIN companies c ON p.company_id = c.company_id WHERE p.student_id = p_student_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetStudentProgress` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetStudentProgress` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetStudentProgress`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetStudentRequirements` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetStudentRequirements` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetStudentRequirements`(IN p_student_id INT)
BEGIN
    SELECT r.*, sr.status as submission_status, sr.file_path, sr.submission_id, sr.remarks, sr.submitted_at 
    FROM requirement_types r 
    LEFT JOIN student_requirements sr ON r.requirement_id = sr.requirement_id AND sr.student_id = p_student_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetUserByEmail` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetUserByEmail` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetUserByEmail`(IN p_email VARCHAR(150))
BEGIN
    SELECT * FROM users WHERE email = p_email;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetUserDetails` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetUserDetails` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetUserDetails`(IN p_user_id INT, IN p_role VARCHAR(50))
BEGIN
    IF p_role = 'student' THEN
        SELECT * FROM students WHERE user_id = p_user_id;
    ELSEIF p_role = 'staff' THEN
        SELECT * FROM staff WHERE user_id = p_user_id;
    ELSEIF p_role = 'admin' THEN
        SELECT * FROM admins WHERE user_id = p_user_id;
    END IF;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetWeeklyReportsByStudentId` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetWeeklyReportsByStudentId` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetWeeklyReportsByStudentId`(IN p_student_id INT)
BEGIN
    SELECT wr.*
    FROM weekly_reports wr
    JOIN ojt_placements p ON wr.placement_id = p.placement_id
    WHERE (p_student_id IS NULL OR p.student_id = p_student_id)
    ORDER BY wr.submitted_at DESC;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RecordAttendance` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RecordAttendance` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RecordAttendance`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RegisterStaff` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RegisterStaff` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RegisterStaff`(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(150),
    IN p_employee_id VARCHAR(30),
    IN p_department VARCHAR(100)
)
BEGIN
    DECLARE new_user_id INT;
    INSERT INTO users (email, password_hash, role, status, requires_password_change)
    VALUES (p_email, p_password_hash, 'staff', 'active', FALSE);
    SET new_user_id = LAST_INSERT_ID();
    INSERT INTO staff (user_id, employee_id, full_name, department)
    VALUES (new_user_id, p_employee_id, p_full_name, p_department);
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RegisterStudent` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RegisterStudent` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RegisterStudent`(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
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
    INSERT INTO users (email, password_hash, role, status, requires_password_change)
    VALUES (p_email, p_password_hash, 'student', 'pending_admin_approval', TRUE);
    SET new_user_id = LAST_INSERT_ID();
    INSERT INTO students (user_id, student_number, full_name, first_name, middle_name, last_name, gender, course, year_level)
    VALUES (new_user_id, p_student_number, p_full_name, p_first_name, p_middle_name, p_last_name, p_gender, p_course, p_year_level);
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RejectApplication` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RejectApplication` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RejectApplication`(IN p_application_id INT)
BEGIN
    UPDATE applications SET status = 'rejected' WHERE application_id = p_application_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ReviewRequirement` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ReviewRequirement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ReviewRequirement`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_SearchUsers` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_SearchUsers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_SearchUsers`(IN p_role VARCHAR(50), IN p_status VARCHAR(50))
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_SubmitEvaluation` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_SubmitEvaluation` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_SubmitEvaluation`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_SubmitRequirement` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_SubmitRequirement` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_SubmitRequirement`(
    IN p_student_id INT,
    IN p_requirement_id INT,
    IN p_file_path VARCHAR(255)
)
BEGIN
    INSERT INTO student_requirements (student_id, requirement_id, file_path, status)
    VALUES (p_student_id, p_requirement_id, p_file_path, 'pending');
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_SubmitWeeklyReport` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_SubmitWeeklyReport` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_SubmitWeeklyReport`(IN p_placement_id INT, IN p_week_number INT, IN p_narrative TEXT)
BEGIN
    INSERT INTO weekly_reports (placement_id, week_number, narrative, status)
    VALUES (p_placement_id, p_week_number, p_narrative, 'submitted');
    SELECT LAST_INSERT_ID() AS insertId;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_UpdateCompanyStatus` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_UpdateCompanyStatus` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_UpdateCompanyStatus`(IN p_company_id INT, IN p_status ENUM('active', 'inactive'))
BEGIN
    UPDATE companies SET status = p_status WHERE company_id = p_company_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_UpdateRequirementTypeStatus` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_UpdateRequirementTypeStatus` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_UpdateRequirementTypeStatus`(IN p_requirement_id INT, IN p_is_required BOOLEAN)
BEGIN
    UPDATE requirement_types SET is_required = p_is_required WHERE requirement_id = p_requirement_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_UpdateUserProfile` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_UpdateUserProfile` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_UpdateUserProfile`(
    IN p_user_id INT,
    IN p_role ENUM('student','staff','admin'),
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(150),
    IN p_student_number VARCHAR(30),
    IN p_course VARCHAR(100),
    IN p_year_level VARCHAR(50),
    IN p_gender VARCHAR(20),
    IN p_employee_id VARCHAR(30),
    IN p_department VARCHAR(100)
)
BEGIN
    UPDATE users
    SET email = p_email,
        password_hash = CASE
            WHEN p_password_hash IS NULL OR p_password_hash = '' THEN password_hash
            ELSE p_password_hash
        END,
        requires_password_change = 0
    WHERE user_id = p_user_id;
    IF p_role = 'student' THEN
        UPDATE students
        SET full_name = p_full_name,
            student_number = COALESCE(NULLIF(p_student_number, ''), student_number),
            course = p_course,
            year_level = p_year_level,
            gender = p_gender
        WHERE user_id = p_user_id;
    ELSEIF p_role = 'staff' THEN
        UPDATE staff
        SET full_name = p_full_name,
            employee_id = COALESCE(NULLIF(p_employee_id, ''), employee_id),
            department = p_department
        WHERE user_id = p_user_id;
    ELSEIF p_role = 'admin' THEN
        UPDATE admins
        SET full_name = p_full_name
        WHERE user_id = p_user_id;
    END IF;
END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
