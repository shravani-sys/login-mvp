const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const IP = '192.168.106.225';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'nathgandha',
  database: 'login_mvp'
};

// Create MySQL connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database: login_mvp');
    connection.release();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection();

// ========== Signup ==========
app.post('/signup', async (req, res) => {
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

  try {
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User  already exists' });
    }

    await pool.execute(
      `INSERT INTO users 
      (username, password, firstName, lastName, email, address, phoneNumber, dob, department, employeeId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, password, firstName, lastName, email, address, phoneNumber, dob, department, employeeId]
    );

    console.log("User  registered:", username);
    return res.status(201).json({ message: 'Signup successful' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Database error during signup' });
  }
});

// ========== Login ==========
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("User  logged in:", username);
    return res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Database error during login' });
  }
});

// ========== Dashboard Data ==========
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

// ========== Staff Endpoints ==========

// Add Staff
app.post('/api/staff', async (req, res) => {
  const { fullName, phoneNumber, gender, dob, joiningDate, photo } = req.body;

  if (!fullName || !phoneNumber || !gender || !dob || !joiningDate) {
    return res.status(400).json({ message: 'All fields except photo are required.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO staff (full_name, phone_number, gender, date_of_birth, joining_date, profile_picture) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, phoneNumber, gender, dob, joiningDate, photo]
    );

    console.log('Staff added with ID:', result.insertId);
    return res.status(201).json({ 
      message: 'Staff added successfully',
      staffId: result.insertId 
    });

  } catch (error) {
    console.error('Add staff error:', error);
    return res.status(500).json({ message: 'Database error while adding staff' });
  }
});

// Get All Staff
app.get('/api/staff', async (req, res) => {
  try {
    const [staff] = await pool.execute('SELECT * FROM staff ORDER BY full_name');
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Database error while fetching staff' });
  }
});

// ========== Services Endpoint ==========
// Add new service (fixed)
app.post('/api/services', async (req, res) => {
  const { title, category, duration, price, description, staff, image } = req.body;

  // Debug log
  console.log("=== New Service Request ===");
  console.log(req.body);
  console.log("===========================");

  // staff is optional now
  if (!title || !category || !duration || !price) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO services (title, category, duration, price, description, staff, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category, duration, price, description || '', staff || null, image || null]
    );

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ success: false, message: 'Database error while adding service' });
  }
});

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const [services] = await pool.execute('SELECT * FROM services ORDER BY title');
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Database error while fetching services' });
  }
});
// DELETE service by ID
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Use pool.execute instead of db.query
    const [result] = await pool.execute('DELETE FROM services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    console.log('Service deleted:', id);
    res.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
});


// ========== Appointments Endpoints ==========

// Add Appointment (UPDATED: Added console.log to debug)
app.post('/api/appointments', async (req, res) => {
  const { customerName, phone, date, time, service, stylist, notes } = req.body;

  // NEW: Log what the server receives (this will show the problem)
  console.log('=== SERVER RECEIVED APPOINTMENT DATA ===');
  console.log('customerName:', customerName);
  console.log('phone:', phone);
  console.log('date:', date);
  console.log('time:', time);
  console.log('service:', service);
  console.log('stylist:', stylist);
  console.log('notes:', notes);
  console.log('Full body:', req.body);
  console.log('=== END LOG ===');

  if (!customerName || !phone || !date || !time || !service || !stylist) {
    return res.status(400).json({ success: false, message: 'All fields except notes are required.' });
  }

  try {
    const [conflicts] = await pool.execute(
      'SELECT * FROM appointments WHERE stylist = ? AND date = ? AND time = ?',
      [stylist, date, time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ success: false, message: `${stylist} already has an appointment at ${time} on ${date}` });
    }

    const [result] = await pool.execute(
      `INSERT INTO appointments (customerName, phone, date, time, service, stylist, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customerName.trim(), phone.trim(), date, time, service, stylist, notes || '']
    );

    console.log('New appointment added with ID:', result.insertId);
    return res.status(201).json({ success: true, appointmentId: result.insertId, message: 'Appointment added successfully' });

  } catch (error) {
    console.error('Add appointment error:', error);
    return res.status(500).json({ success: false, message: 'Database error while adding appointment' });
  }
});

// Get All Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM appointments';
    let params = [];

    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }

    query += ' ORDER BY date ASC, time ASC';

    const [appointments] = await pool.execute(query, params);
    res.json({ success: true, appointments, total: appointments.length });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Database error while fetching appointments' });
  }
});

// Get Appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  const appointmentId = parseInt(req.params.id);

  try {
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment: appointments[0] });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Database error while fetching appointment' });
  }
});

// Delete Appointment
app.delete('/api/appointments/:id', async (req, res) => {
  const appointmentId = parseInt(req.params.id);

  try {
    const [existing] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await pool.execute('DELETE FROM appointments WHERE id = ?', [appointmentId]);
    console.log('Appointment deleted:', appointmentId);
    res.json({ success: true, message: 'Appointment deleted successfully' });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, message: 'Database error while deleting appointment' });
  }
});
// Update Appointment
app.put('/api/appointments/:id', async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const { customerName, phone, date, time, service, stylist, notes } = req.body;

  if (!customerName || !phone || !date || !time || !service || !stylist) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields except notes are required.' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Appointment not found' });
    }

    await pool.execute(
      `UPDATE appointments 
       SET customerName = ?, phone = ?, date = ?, time = ?, service = ?, stylist = ?, notes = ?
       WHERE id = ?`,
      [customerName.trim(), phone.trim(), date, time, service, stylist, notes || '', appointmentId]
    );

    console.log('Appointment updated:', appointmentId);
    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Database error while updating appointment' });
  }
});


// ========== Start Server ==========
app.listen(PORT, IP, () => {
  console.log(`Server running at http://${IP}:${PORT}`);
});
