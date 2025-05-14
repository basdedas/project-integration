const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { connectToDatabase, sql } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to database
connectToDatabase();

// Admin Signup Endpoint
app.post('/api/signup/admin', async (req, res) => {
  try {
    const { institution,username, email, password } = req.body;

    // Check if admin already exists
    const userCheck = await sql.query`
      SELECT * FROM administrators WHERE username = email = ${email}
    `;
    
    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new admin
    await sql.query`
      INSERT INTO administrators (institution,username, email, password_hash)
      VALUES (${institution},${username}, ${email}, ${passwordHash})
    `;
    
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error('Admin signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Signup Endpoint
app.post('/api/signup/user', async (req, res) => {
  try {
    const { username, email, password, birthday ,height , weight ,gender , phonenumber , instituition , doctor_id} = req.body;

    // Check if user already exists
    const userCheck = await sql.query`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `;
    
    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    await sql.query`
      INSERT INTO users (username, email, password_hash ,birthday, height ,weight , gender , phonenumber , instituition,doctor_id)
      VALUES (${username}, ${email}, ${passwordHash} , ${birthday} , ${height} , ${gender} , ${phonenumber} , ${instituition} ,${doctor_id})
    `;
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('User signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login Endpoint
app.post('/api/login/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin
    const result = await sql.query`
      SELECT * FROM administrators WHERE username = ${username}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const admin = result.recordset[0];
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Admin login successful',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login Endpoint
app.post('/api/login/user', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const result = await sql.query`
      SELECT * FROM users WHERE username = ${username}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.recordset[0];
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      message: 'User login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log