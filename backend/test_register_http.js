async function testRegisterHttp() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_number: '2026-994215',
        first_name: 'Mark Allene',
        middle_name: 'Lofranco',
        last_name: 'Cayda',
        email: 'test' + Date.now() + '@student.edu.ph',
        password: 'PENDING_APPROVAL',
        gender: 'Male',
        course: 'BS Computer Science',
        year_section: '4B',
        year_level: '4B'
      })
    });
    const data = await res.json();
    console.log('Success:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRegisterHttp();
