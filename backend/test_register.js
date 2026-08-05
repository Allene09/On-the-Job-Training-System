const AuthModel = require('./src/models/AuthModel');
const bcrypt = require('bcrypt');

async function testRegister() {
  try {
    const password = 'PENDING_APPROVAL';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await AuthModel.registerStudent({
      email: 'test' + Date.now() + '@student.edu.ph',
      hashedPassword,
      student_number: '2026-999999',
      full_name: 'Test Name',
      first_name: 'Test',
      middle_name: 'M',
      last_name: 'Name',
      gender: 'Male',
      course: 'BS CS',
      resolvedYearLevel: '4B'
    });
    console.log('Registration successful!');
  } catch (error) {
    console.error('Registration failed:', error);
  } finally {
    process.exit();
  }
}
testRegister();
