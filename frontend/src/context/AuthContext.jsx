import { createContext, useContext, useState } from 'react';

// Static mock data mirroring db.js tables
export const mockData = {
  users: [
    { user_id: 1, email: 'student@school.edu.ph',     role: 'student', status: 'active' },
    { user_id: 2, email: 'coordinator@school.edu.ph', role: 'staff',   status: 'active' },
    { user_id: 3, email: 'admin@school.edu.ph',       role: 'admin',   status: 'active' },
    { user_id: 4, email: 'maria.santos@student.edu.ph', role: 'student', status: 'active' }
  ],
  students: [
    { student_id: 1, user_id: 1, student_number: '2022-00123', full_name: 'Juan Dela Cruz',  course: 'BS Information Technology', year_level: '4th Year', contact_number: '+63 917 123 4567', address: 'Quezon City, Metro Manila', required_hours: 486 },
    { student_id: 2, user_id: 4, student_number: '2022-00456', full_name: 'Maria Santos',    course: 'BS Computer Science',        year_level: '4th Year', contact_number: '+63 918 987 6543', address: 'Makati City, Metro Manila',  required_hours: 486 }
  ],
  staff: [
    { staff_id: 1, user_id: 2, employee_id: 'EMP-2019-88', full_name: 'Prof. Alejandro Rivera', department: 'College of Computer Studies', contact_number: '+63 919 555 0199' }
  ],
  admins: [
    { admin_id: 1, user_id: 3, full_name: 'Dr. Eleanor Vance' }
  ],
  companies: [
    { company_id: 1, company_name: 'TechNexus Innovations Inc.', industry: 'Software Development',             address: 'BGC, Taguig City',          contact_person: 'Sarah Jenkins',     contact_number: '+63 2 8888 1234', email: 'careers@technexus.ph',         slots_available: 5, status: 'active' },
    { company_id: 2, company_name: 'CyberShield Solutions',       industry: 'Cybersecurity & IT Infrastructure',address: 'Ortigas Center, Pasig City', contact_person: 'Mark Anthony Tan', contact_number: '+63 2 8777 9999', email: 'hr@cybershield.com.ph',        slots_available: 3, status: 'active' },
    { company_id: 3, company_name: 'CloudScale Data Labs',        industry: 'Data Analytics & Cloud Services', address: 'Ayala Ave, Makati City',     contact_person: 'Elena Gomez',      contact_number: '+63 2 8333 4444', email: 'recruitment@cloudscale.io',   slots_available: 8, status: 'active' }
  ],
  requirement_types: [
    { requirement_id: 1, name: 'Updated Resume / CV',              description: 'Comprehensive CV with contact details and skills',              is_required: true,  deadline: '2026-08-15' },
    { requirement_id: 2, name: 'Parental Consent Form',           description: 'Signed consent form with parent/guardian ID photocopy',        is_required: true,  deadline: '2026-08-15' },
    { requirement_id: 3, name: 'Medical Certificate & Fit to Work',description: 'Issued by registered physician within 30 days',               is_required: true,  deadline: '2026-08-20' },
    { requirement_id: 4, name: 'Endorsement Letter from Dean',    description: 'Official recommendation letter from department',               is_required: true,  deadline: '2026-08-25' },
    { requirement_id: 5, name: 'Memorandum of Agreement (MOA)',   description: 'Signed contract between University and HTE Partner',           is_required: false, deadline: '2026-09-01' }
  ],
  student_requirements: [
    { submission_id: 1, student_id: 1, requirement_id: 1, file_path: '/uploads/resume_juan.pdf',   status: 'approved', remarks: 'Complete & accurate',   reviewed_by: 2, submitted_at: '2026-07-10T09:00:00Z', reviewed_at: '2026-07-11T10:00:00Z' },
    { submission_id: 2, student_id: 1, requirement_id: 2, file_path: '/uploads/consent_juan.pdf',  status: 'approved', remarks: 'Verified signature',     reviewed_by: 2, submitted_at: '2026-07-10T09:15:00Z', reviewed_at: '2026-07-11T10:05:00Z' },
    { submission_id: 3, student_id: 1, requirement_id: 3, file_path: '/uploads/medical_juan.pdf',  status: 'pending',  remarks: null,                     reviewed_by: null, submitted_at: '2026-07-18T14:00:00Z', reviewed_at: null }
  ],
  applications: [
    { application_id: 1, student_id: 1, company_id: 1, status: 'accepted', applied_at: '2026-07-12T08:00:00Z', approved_by: 2, approved_at: '2026-07-13T10:00:00Z' },
    { application_id: 2, student_id: 2, company_id: 2, status: 'pending',  applied_at: '2026-07-19T11:00:00Z', approved_by: null, approved_at: null }
  ],
  ojt_placements: [
    { placement_id: 1, student_id: 1, company_id: 1, start_date: '2026-07-14', end_date: '2026-10-30', required_hours: 486, total_hours_rendered: 124.50, status: 'ongoing' }
  ],
  attendance: [
    { attendance_id: 1, placement_id: 1, log_date: '2026-07-14', time_in: '08:00', time_out: '17:00', hours_rendered: 8.00,  status: 'present', remarks: 'Day 1 orientation'       },
    { attendance_id: 2, placement_id: 1, log_date: '2026-07-15', time_in: '08:00', time_out: '17:00', hours_rendered: 8.00,  status: 'present', remarks: 'Setup dev environment'   },
    { attendance_id: 3, placement_id: 1, log_date: '2026-07-16', time_in: '08:30', time_out: '17:30', hours_rendered: 8.00,  status: 'present', remarks: 'Frontend bug fixing'     },
    { attendance_id: 4, placement_id: 1, log_date: '2026-07-17', time_in: '08:00', time_out: '17:00', hours_rendered: 8.00,  status: 'present', remarks: 'API endpoint testing'    },
    { attendance_id: 5, placement_id: 1, log_date: '2026-07-18', time_in: '08:00', time_out: '17:00', hours_rendered: 8.00,  status: 'present', remarks: 'Code review session'     },
    { attendance_id: 6, placement_id: 1, log_date: '2026-07-21', time_in: '08:00', time_out: '17:00', hours_rendered: 8.00,  status: 'present', remarks: 'System testing'          }
  ],
  weekly_reports: [
    { report_id: 1, placement_id: 1, week_number: 1, narrative: 'Completed company orientation, initialized React environment, and began working on UI components. Gained exposure to Agile workflows.', status: 'reviewed', submitted_at: '2026-07-18T17:00:00Z', reviewed_by: 2 }
  ],
  evaluations: [
    { evaluation_id: 1, placement_id: 1, evaluator_name: 'Sarah Jenkins (Supervisor)', attendance_score: 30.00, work_quality_score: 33.50, attitude_score: 30.00, total_score: 93.50, remarks: 'Excellent performance during Week 1!', evaluated_at: '2026-07-19T10:00:00Z' }
  ],
  notifications: [
    { notification_id: 1, user_id: 1, message: "Your 'Parental Consent Form' has been approved by Prof. Alejandro Rivera.", type: 'approval',  is_read: false, created_at: '2026-07-11T10:05:00Z' },
    { notification_id: 2, user_id: 1, message: 'Your application to TechNexus Innovations Inc. has been accepted!',          type: 'placement', is_read: false, created_at: '2026-07-13T10:00:00Z' },
    { notification_id: 3, user_id: 2, message: 'Maria Santos submitted a new application to CyberShield Solutions.',          type: 'application', is_read: false, created_at: '2026-07-19T11:05:00Z' }
  ],
  announcements: [
    { announcement_id: 1, posted_by: 2, title: 'Mid-Term OJT Monitoring Visit Scheduled', content: 'Coordinators will conduct virtual and physical site visits starting August 15. Please ensure your DTR and Weekly Reports are up-to-date.', created_at: '2026-07-15T09:00:00Z' },
    { announcement_id: 2, posted_by: 3, title: 'Submission Deadline for Pre-OJT Requirements', content: 'Reminder to all 4th year students: Deadline for medical certificates and parental consent is August 20, 2026. Incomplete submissions may result in delayed placement.', created_at: '2026-07-16T14:00:00Z' }
  ]
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (role) => {
    if (role === 'student') {
      setCurrentUser({
        user_id: 1, email: 'student@school.edu.ph', role: 'student', status: 'active',
        profile: mockData.students[0]
      });
    } else if (role === 'staff') {
      setCurrentUser({
        user_id: 2, email: 'coordinator@school.edu.ph', role: 'staff', status: 'active',
        profile: mockData.staff[0]
      });
    } else if (role === 'admin') {
      setCurrentUser({
        user_id: 3, email: 'admin@school.edu.ph', role: 'admin', status: 'active',
        profile: mockData.admins[0]
      });
    }
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, mockData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
