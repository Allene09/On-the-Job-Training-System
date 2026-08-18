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
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `admins` */

insert  into `admins`(`admin_id`,`user_id`,`full_name`,`first_name`,`middle_name`,`last_name`) values (1,1,'Mark Allene L. Cayda','Mark Allene','L.','Cayda');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `applications` */

insert  into `applications`(`application_id`,`student_id`,`company_id`,`status`,`applied_at`,`approved_by`,`approved_at`) values (2,10,1,'pending','2026-08-05 21:22:10',NULL,NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

/*Data for the table `companies` */

insert  into `companies`(`company_id`,`company_name`,`industry`,`address`,`contact_person`,`contact_number`,`email`,`slots_available`,`photo_url`,`requirements`,`status`,`added_by`,`created_at`) values (1,'Bicto','Software, Networking, Infra','4th Floor, New Provincial Capitol Complex Lino Chatto Drive, Cogon District, Tagbilaran City, Bohol 6300 Philippines','Bojos','038.411.0138','bictu.innovation@gmail.com',2,'/uploads/1785898806620.png','MOA, Resume, Application Letter, Drug Test','active',1,'2026-08-01 13:14:04'),(2,'Sagility','IT','1st and 2nd Floors of the Innercore Building, Old Tagbilaran Airport Compound, Barangay Booy, Tagbilaran City, Bohol','HR','0906-746-4252','Bohol.Careers@Sagilityhealth.com',5,'/uploads/1785898941354.jpg','MOA, Resume, Application Letter, Grade','active',1,'2026-08-05 09:40:31'),(3,'AGC-Plaza Marcela','IT','Pamaong Street corner Belderol Street, Cogon District, Tagbilaran City, 6300 Bohol, Philippines','63 38 411 5425','','customercare@alturasbohol.com',2,'/uploads/1785897776674.jpg','MOA, Resume, Application Letter, ATM Account Number, Medical Certificate, Police/Barangay Clearance','active',1,'2026-08-05 10:18:12'),(4,'Tagbilaran City College','IT','Dampas District, Tagbilaran City, Bohol 6300','tagbilarancitycollege@gmail.com','','tagbilarancitycollege@gmail.com',10,'/uploads/1785995208382.jpg',NULL,'active',1,'2026-08-05 21:56:01'),(5,'BOHECO II ','IT','Cantagay, JAgna','','','',5,'/uploads/1785995577446.jpg',NULL,'active',1,'2026-08-05 21:57:24'),(6,'Provincial Procurement Management  Unit','IT','New Provincial Capitol Complex Lino Chatto Drive, Cogon District, Tagbilaran City, Bohol 6300 Philippines','','','',5,'/uploads/1785995727621.jpg',NULL,'active',1,'2026-08-05 21:58:25'),(7,'HNU FabLab','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 21:59:42'),(8,'HNU MIS Office','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:00:12'),(9,'HNU MANAGEMENT DEPARTMENT','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:00:43'),(10,'AGC- ICM MALL IT','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:01:47'),(11,'AGC- CORP IT','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:02:11'),(12,'Social Security System(SSS)','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:03:06'),(13,'BLENDITORO CORP BOHOL','SOFTWARE','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:04:00'),(14,'IBEX Global Solutions','','','','','',9,NULL,NULL,'active',1,'2026-08-05 22:05:43'),(15,'CAAP - BOHOL PANGALAO INTERNATIONAL AIRPORT','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:06:21'),(16,'BOHECO I','IT','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:06:58'),(17,'LGU CARMEN','','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:07:23'),(18,'LGU BATUAN','','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:07:34'),(19,'BISU BILAR','','','','','',5,NULL,NULL,'active',1,'2026-08-05 22:07:53');

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `evaluations` */


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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `ojt_placements` */


/*Table structure for table `requirement_types` */

DROP TABLE IF EXISTS `requirement_types`;

CREATE TABLE `requirement_types` (
  `requirement_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  `deadline` date DEFAULT NULL,
  PRIMARY KEY (`requirement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `requirement_types` */


/*Table structure for table `staff` */

DROP TABLE IF EXISTS `staff`;

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(30) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `staff` */

insert  into `staff`(`staff_id`,`user_id`,`employee_id`,`full_name`,`first_name`,`middle_name`,`last_name`,`department`,`contact_number`) values (1,5,'5','Mark Allene L. Cayda','Mark Allene','L.','Cayda','ctech',NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `student_requirements` */


/*Table structure for table `students` */

DROP TABLE IF EXISTS `students`;

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `student_number` varchar(30) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `year_level` varchar(50) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `required_hours` int(11) DEFAULT '486',
  `profile_photo` varchar(255) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_number` (`student_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

/*Data for the table `students` */

insert  into `students`(`student_id`,`user_id`,`student_number`,`last_name`,`middle_name`,`first_name`,`course`,`year_level`,`gender`,`contact_number`,`address`,`required_hours`,`profile_photo`,`full_name`) values (10,14,'2026-753657','Cayda','Lofranco','Mark Allene','BS Computer Science ','4B','Male',NULL,NULL,486,NULL,'Mark Allene Lofranco Cayda'),(11,15,'2026-540375','Peresores','Filliar','Jeffrey','BS Computer Science','4B','Male',NULL,NULL,486,NULL,'Jeffrey Filliar Peresores'),(12,16,'2026-412484','Requierme','Sosmena','Ray Joshua','computer science','Bscs - 4','Male',NULL,NULL,486,NULL,'Ray Joshua Sosmena Requierme'),(13,17,'2026-540210','Bacasmas','Gerald','Mike','BS in Computer Science ','4B','Male',NULL,NULL,486,NULL,'Mike Gerald Bacasmas');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `plain_password` varchar(255) DEFAULT NULL,
  `role` enum('student','staff','admin') NOT NULL,
  `status` enum('active','inactive','pending','pending_admin_approval') DEFAULT 'pending',
  `requires_password_change` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

/*Data for the table `users` */

insert  into `users`(`user_id`,`email`,`password_hash`,`plain_password`,`role`,`status`,`requires_password_change`,`created_at`,`updated_at`) values (1,'Admin@gmail.com','Admin123','Admin123','admin','active',0,'2026-07-31 19:18:46','2026-08-18 10:48:45'),(5,'Allene@gmail.com','allene123','allene123','staff','active',0,'2026-08-01 12:45:21','2026-08-18 10:48:45'),(14,'markallene.cayda@bisu.edu.ph','$2b$10$eEkm1sEb8iXaWqzvovodIOiU3P.bnSlKKnW8nAyV.huhl6J.FDA/u','markallenecayda123','student','active',0,'2026-08-05 20:10:22','2026-08-18 10:52:45'),(15,'jeffrey.peresores@bisu.edu.ph','$2b$10$MoS2mzbMAXFyOt1yY4eLauOkp2RhvuWfdPD1b.GjVoAB7PSJMKd3.','jeffreyperesores123','student','active',1,'2026-08-06 13:26:58','2026-08-18 10:52:45'),(16,'rayjoshua.requierme@bisu.edu.ph','$2b$10$l.GvYFCL1zMGTqeXzLXTJeil8ESkgQ4L2.Qc72mOsPm7gk.EqnfL2','rayjoshuarequierme123','student','active',0,'2026-08-18 09:55:42','2026-08-18 10:52:45'),(17,'mike.bacasmas@bisu.edu.ph','$2b$10$5wSASH6FfQrUs4Bk7Z3P0.FNZFKpuQV/hGpcYisyYH1tNP/.Kojvy','mikebacasmas123','student','active',0,'2026-08-18 10:14:30','2026-08-18 10:52:45');

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
        IN p_generated_password VARCHAR(255),
        IN p_plain_password VARCHAR(255)
      )
BEGIN
        UPDATE users 
        SET 
          status = 'active', 
          password_hash = p_generated_password, 
          plain_password = p_plain_password,
          requires_password_change = 0,
          updated_at = NOW()
        WHERE user_id = p_user_id;

        SELECT p_user_id AS user_id;
      END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_ChangeUserPassword` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_ChangeUserPassword` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_ChangeUserPassword`(
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
        SELECT 
          u.user_id, u.email, u.role, u.status, u.plain_password, u.requires_password_change, u.created_at, u.updated_at,
          COALESCE(s.first_name, st.first_name, a.first_name, '') AS first_name,
          COALESCE(s.middle_name, st.middle_name, a.middle_name, '') AS middle_name,
          COALESCE(s.last_name, st.last_name, a.last_name, '') AS last_name,
          COALESCE(s.full_name, st.full_name, a.full_name, u.email) AS full_name,
          s.student_id, s.student_number, s.course, s.year_level, s.gender, s.contact_number AS student_contact, s.address,
          st.staff_id, st.employee_id, st.department, st.contact_number AS staff_contact,
          a.admin_id
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN staff st ON u.user_id = st.user_id
        LEFT JOIN admins a ON u.user_id = a.user_id
        ORDER BY u.created_at DESC;
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

/* Procedure structure for procedure `sp_GetMonthlyStatisticalReport` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetMonthlyStatisticalReport` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetMonthlyStatisticalReport`(IN p_year INT)
BEGIN
          SELECT 
              m.month_num,
              m.month_name,
              COALESCE(u.registrations, 0) AS registrations,
              COALESCE(p.placements, 0) AS placements,
              COALESCE(a.hours_tracked, 0) AS hours_tracked
          FROM (
              SELECT 1 AS month_num, 'Jan' AS month_name UNION SELECT 2, 'Feb' UNION SELECT 3, 'Mar'
              UNION SELECT 4, 'Apr' UNION SELECT 5, 'May' UNION SELECT 6, 'Jun'
              UNION SELECT 7, 'Jul' UNION SELECT 8, 'Aug' UNION SELECT 9, 'Sep'
              UNION SELECT 10, 'Oct' UNION SELECT 11, 'Nov' UNION SELECT 12, 'Dec'
          ) m
          LEFT JOIN (
              SELECT MONTH(created_at) AS month_num, COUNT(*) AS registrations
              FROM users 
              WHERE YEAR(created_at) = p_year AND role IN ('student', 'staff')
              GROUP BY MONTH(created_at)
          ) u ON m.month_num = u.month_num
          LEFT JOIN (
              SELECT MONTH(start_date) AS month_num, COUNT(*) AS placements
              FROM ojt_placements 
              WHERE YEAR(start_date) = p_year 
              GROUP BY MONTH(start_date)
          ) p ON m.month_num = p.month_num
          LEFT JOIN (
              SELECT MONTH(log_date) AS month_num, SUM(hours_rendered) AS hours_tracked
              FROM attendance 
              WHERE YEAR(log_date) = p_year 
              GROUP BY MONTH(log_date)
          ) a ON m.month_num = a.month_num
          ORDER BY m.month_num;
      END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_GetPendingAccounts` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_GetPendingAccounts` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetPendingAccounts`()
BEGIN
        SELECT 
          u.user_id, u.email, u.role, u.status, u.created_at,
          s.student_id, s.student_number, s.first_name, s.middle_name, s.last_name, s.full_name,
          s.course, s.year_level, s.gender, s.contact_number, s.address,
          a.application_id, a.company_id, c.company_name
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN applications a ON s.student_id = a.student_id
        LEFT JOIN companies c ON a.company_id = c.company_id
        WHERE u.status IN ('pending', 'pending_admin_approval')
        ORDER BY u.created_at DESC;
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

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_GetUserDetails`(IN p_user_id INT)
BEGIN
        SELECT 
          u.user_id, u.email, u.role, u.status, u.plain_password, u.requires_password_change, u.created_at,
          COALESCE(s.first_name, st.first_name, a.first_name, '') AS first_name,
          COALESCE(s.middle_name, st.middle_name, a.middle_name, '') AS middle_name,
          COALESCE(s.last_name, st.last_name, a.last_name, '') AS last_name,
          COALESCE(s.full_name, st.full_name, a.full_name, u.email) AS full_name,
          s.student_id, s.student_number, s.course, s.year_level, s.gender, s.contact_number AS student_contact, s.address,
          st.staff_id, st.employee_id, st.department, st.contact_number AS staff_contact,
          a.admin_id
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN staff st ON u.user_id = st.user_id
        LEFT JOIN admins a ON u.user_id = a.user_id
        WHERE u.user_id = p_user_id;
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
        IN p_plain_password VARCHAR(255),
        IN p_employee_id VARCHAR(30),
        IN p_first_name VARCHAR(50),
        IN p_middle_name VARCHAR(50),
        IN p_last_name VARCHAR(50),
        IN p_full_name VARCHAR(150),
        IN p_department VARCHAR(100),
        IN p_contact_number VARCHAR(20),
        IN p_status VARCHAR(50)
      )
BEGIN
        DECLARE v_user_id INT;
        DECLARE v_status VARCHAR(50);
        
        SET v_status = IFNULL(p_status, 'active');

        INSERT INTO users (email, password_hash, plain_password, role, status, requires_password_change)
        VALUES (p_email, p_password_hash, p_plain_password, 'staff', v_status, 0);

        SET v_user_id = LAST_INSERT_ID();

        INSERT INTO staff (user_id, employee_id, first_name, middle_name, last_name, full_name, department, contact_number)
        VALUES (v_user_id, p_employee_id, p_first_name, p_middle_name, p_last_name, p_full_name, p_department, p_contact_number);

        SELECT v_user_id AS user_id;
      END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_RegisterStudent` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_RegisterStudent` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_RegisterStudent`(
        IN p_email VARCHAR(150),
        IN p_password_hash VARCHAR(255),
        IN p_plain_password VARCHAR(255),
        IN p_student_number VARCHAR(30),
        IN p_first_name VARCHAR(50),
        IN p_middle_name VARCHAR(50),
        IN p_last_name VARCHAR(50),
        IN p_full_name VARCHAR(150),
        IN p_course VARCHAR(100),
        IN p_year_level VARCHAR(50),
        IN p_gender VARCHAR(20),
        IN p_contact_number VARCHAR(20),
        IN p_address VARCHAR(255),
        IN p_status VARCHAR(50)
      )
BEGIN
        DECLARE v_user_id INT;
        DECLARE v_status VARCHAR(50);
        
        SET v_status = IFNULL(p_status, 'pending_admin_approval');

        INSERT INTO users (email, password_hash, plain_password, role, status, requires_password_change)
        VALUES (p_email, p_password_hash, p_plain_password, 'student', v_status, 0);

        SET v_user_id = LAST_INSERT_ID();

        INSERT INTO students (user_id, student_number, first_name, middle_name, last_name, full_name, course, year_level, gender, contact_number, address)
        VALUES (v_user_id, p_student_number, p_first_name, p_middle_name, p_last_name, p_full_name, p_course, p_year_level, p_gender, p_contact_number, p_address);

        SELECT v_user_id AS user_id;
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

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_SearchUsers`(IN p_search VARCHAR(100))
BEGIN
        SELECT 
          u.user_id, u.email, u.role, u.status, u.plain_password, u.created_at,
          COALESCE(s.first_name, st.first_name, a.first_name, '') AS first_name,
          COALESCE(s.middle_name, st.middle_name, a.middle_name, '') AS middle_name,
          COALESCE(s.last_name, st.last_name, a.last_name, '') AS last_name,
          COALESCE(s.full_name, st.full_name, a.full_name, u.email) AS full_name,
          s.student_number, s.course, s.year_level, s.gender, s.contact_number AS student_contact, s.address,
          st.employee_id, st.department, st.contact_number AS staff_contact
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN staff st ON u.user_id = st.user_id
        LEFT JOIN admins a ON u.user_id = a.user_id
        WHERE 
          u.email LIKE CONCAT('%', p_search, '%')
          OR s.full_name LIKE CONCAT('%', p_search, '%')
          OR st.full_name LIKE CONCAT('%', p_search, '%')
          OR a.full_name LIKE CONCAT('%', p_search, '%')
          OR s.student_number LIKE CONCAT('%', p_search, '%')
          OR st.employee_id LIKE CONCAT('%', p_search, '%')
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
        IN p_role VARCHAR(20),
        IN p_email VARCHAR(150),
        IN p_first_name VARCHAR(50),
        IN p_middle_name VARCHAR(50),
        IN p_last_name VARCHAR(50),
        IN p_full_name VARCHAR(150),
        IN p_password_hash VARCHAR(255),
        IN p_plain_password VARCHAR(255),
        IN p_contact_number VARCHAR(20),
        IN p_department VARCHAR(100),
        IN p_address VARCHAR(255),
        IN p_student_number VARCHAR(30),
        IN p_course VARCHAR(100),
        IN p_year_level VARCHAR(50),
        IN p_gender VARCHAR(20),
        IN p_employee_id VARCHAR(30)
      )
BEGIN
        -- Update user credentials if email or password passed
        UPDATE users 
        SET 
          email = IFNULL(p_email, email),
          password_hash = CASE WHEN p_password_hash IS NOT NULL AND p_password_hash != '' THEN p_password_hash ELSE password_hash END,
          plain_password = CASE WHEN p_plain_password IS NOT NULL AND p_plain_password != '' THEN p_plain_password ELSE plain_password END,
          updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Update role-specific profile
        IF p_role = 'student' THEN
          UPDATE students 
          SET 
            first_name = IFNULL(p_first_name, first_name),
            middle_name = IFNULL(p_middle_name, middle_name),
            last_name = IFNULL(p_last_name, last_name),
            full_name = IFNULL(p_full_name, full_name),
            student_number = IFNULL(p_student_number, student_number),
            course = IFNULL(p_course, course),
            year_level = IFNULL(p_year_level, year_level),
            gender = IFNULL(p_gender, gender),
            contact_number = IFNULL(p_contact_number, contact_number),
            address = IFNULL(p_address, address)
          WHERE user_id = p_user_id;
        ELSEIF p_role = 'staff' THEN
          UPDATE staff 
          SET 
            first_name = IFNULL(p_first_name, first_name),
            middle_name = IFNULL(p_middle_name, middle_name),
            last_name = IFNULL(p_last_name, last_name),
            full_name = IFNULL(p_full_name, full_name),
            employee_id = IFNULL(p_employee_id, employee_id),
            department = IFNULL(p_department, department),
            contact_number = IFNULL(p_contact_number, contact_number)
          WHERE user_id = p_user_id;
        ELSEIF p_role = 'admin' THEN
          UPDATE admins 
          SET 
            first_name = IFNULL(p_first_name, first_name),
            middle_name = IFNULL(p_middle_name, middle_name),
            last_name = IFNULL(p_last_name, last_name),
            full_name = IFNULL(p_full_name, full_name)
          WHERE user_id = p_user_id;
        END IF;

        SELECT p_user_id AS user_id;
      END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_UpdateUserStatus` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_UpdateUserStatus` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`Ojt_Db`@`localhost` PROCEDURE `sp_UpdateUserStatus`(
        IN p_user_id INT,
        IN p_status VARCHAR(50)
      )
BEGIN
        UPDATE users 
        SET status = p_status, updated_at = NOW()
        WHERE user_id = p_user_id;

        SELECT p_user_id AS user_id, p_status AS status;
      END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
