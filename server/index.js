const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'codetrip_secret_key';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database Tables
const initDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Create users table if not exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        profile_img VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table initialized');
    conn.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
};
initDB();

// --- Auth Routes ---

// 1. Sign Up
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  console.log('Signup Attempt:', { email, name });
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    console.log('Signup Success:', email);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImg: user.profile_img
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Board Routes ---

app.get('/api/boards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/boards/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boards', async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO boards (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );
    res.status(201).json({ id: result.insertId, title, content, author });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/boards/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    await pool.query(
      'UPDATE boards SET title = ?, content = ? WHERE id = ?',
      [title, content, req.params.id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/boards/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM boards WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
