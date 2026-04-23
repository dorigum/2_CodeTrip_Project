const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'codetrip_secret_key';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

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
    
    // Ensure column is VARCHAR(255) even if it was previously TEXT
    await conn.query('ALTER TABLE users MODIFY profile_img VARCHAR(255)');
    
    console.log('✅ Users table initialized and optimized');
    conn.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
};
initDB();

// Middleware: Authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

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

// 3. Update Profile (Name, Profile Image)
app.put('/api/user/update', authenticateToken, async (req, res) => {
  const { name, profileImg } = req.body;
  const userId = req.user.id;

  try {
    // profileImg를 DB 컬럼 profile_img에 매핑
    await pool.query(
      'UPDATE users SET name = ?, profile_img = ? WHERE id = ?',
      [name, profileImg, userId]
    );
    res.json({ message: 'Profile updated successfully', user: { name, profileImg } });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3-1. Upload Profile Image File
app.post('/api/user/upload', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Construct the public URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Password
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Password changed successfully' });
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
