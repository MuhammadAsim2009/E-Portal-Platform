// using native fetch

async function testAuth() {
  const url = 'http://localhost:5005/api/auth/register';
  const data = {
    name: 'Test Agent',
    email: 'agent@university.edu',
    password: 'Password123!',
    role: 'student'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log('Response Status:', res.status);
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAuth();
