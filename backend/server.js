// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Dummy in-memory store
const users = [];

app.post('/signup', (req, res) => {
  const {
    username, password, confirmPassword, firstName, lastName,
    email, address, phoneNumber, dob, department, employeeId
  } = req.body;

  // Basic validation
  if (!username || !password || !confirmPassword || !firstName || !lastName ||
    !email || !address || !phoneNumber || !dob || !department || !employeeId) {
    return res.status(400).json({ message: 'Please fill all the fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({
    username, password, firstName, lastName,
    email, address, phoneNumber, dob, department, employeeId
  });

  return res.status(201).json({ message: 'Signup successful' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.status(200).json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
