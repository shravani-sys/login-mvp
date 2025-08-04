const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const IP = '10.21.202.225';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// In-memory data stores
const users = [];
const staffList = [];

// ========== Signup ========== //
app.post('/signup', (req, res) => {
  const {
    username, password, confirmPassword, firstName, lastName,
    email, address, phoneNumber, dob, department, employeeId
  } = req.body;

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

  console.log("Current users:", users);

  return res.status(201).json({ message: 'Signup successful' });
});

// ========== Login ========== //
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.status(200).json({ message: 'Login successful' });
});

// ========== Dashboard Data ========== //
app.get('/api/dashboard', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'dashboardData.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dashboard data:', err);
      return res.status(500).json({ message: 'Failed to load dashboard data' });
    }

    res.json(JSON.parse(data));
  });
});

// ========== Add Staff ========== //
app.post('/api/staff', (req, res) => {
  const { name, phone, gender, dob, joiningDate, photo } = req.body;

  if (!name || !phone || !gender || !dob || !joiningDate) {
    return res.status(400).json({ message: 'All fields except photo are required.' });
  }

  const newStaff = { name, phone, gender, dob, joiningDate, photo };
  staffList.push(newStaff);

  console.log('New staff added:', newStaff);
  console.log('Current staff list:', staffList);

  return res.status(201).json({ message: 'Staff added successfully' });
});

// ========== Get All Staff ========== //
app.get('/api/staff', (req, res) => {
  res.json(staffList);
});

// ========== Start Server ========== //
app.listen(PORT, IP, () => {
  console.log(`Server running at http://${IP}:${PORT}`);
});
