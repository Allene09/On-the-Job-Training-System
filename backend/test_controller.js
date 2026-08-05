const authController = require('./src/controllers/authController');
require('dotenv').config();

async function testController() {
  const req = {
    body: {
      student_number: '2026-994215',
      first_name: 'Mark Allene',
      middle_name: 'Lofranco',
      last_name: 'Cayda',
      email: 'markallene.cayda@student.edu.ph',
      password: 'PENDING_APPROVAL',
      gender: 'Male',
      course: 'BS Computer Science',
      year_section: '4B',
      year_level: '4B',
      company_id: null
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Response:', this.statusCode, data);
    }
  };

  await authController.registerStudent(req, res);
}

testController();
