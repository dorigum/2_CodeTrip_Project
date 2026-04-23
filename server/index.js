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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_id VARCHAR(50) NOT NULL,
        user_id INT,
        nickname VARCHAR(100) NOT NULL DEFAULT '익명',
        body TEXT NOT NULL,
        likes INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_content_id (content_id)
      )
    `);

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

// 5. Forgot Password (Reset via Email & Name Verification)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, name, newPassword } = req.body;
  
  // 입력값 정규화 (공백 제거)
  const cleanEmail = email?.trim();
  const cleanName = name?.trim();

  console.log('Password Reset Attempt:', { cleanEmail, cleanName });

  try {
    // 1. 먼저 이메일로 사용자 검색
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: '해당 이메일로 등록된 계정을 찾을 수 없습니다.' });
    }

    const user = users[0];

    // 2. 이메일은 맞는데 이름이 일치하지 않는 경우
    if (user.name !== cleanName) {
      return res.status(400).json({ message: '이메일과 이름 정보가 일치하지 않습니다.' });
    }

    // 3. 모든 정보 일치 시 비밀번호 해싱 및 업데이트
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, user.id]);

    console.log('Reset Success for:', cleanEmail);
    res.json({ message: '비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요.' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ error: '서버 오류로 인해 비밀번호를 재설정할 수 없습니다.' });
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

// --- Comment Routes ---

// 코멘트 조회
app.get('/api/comments/:contentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE content_id = ? ORDER BY created_at DESC',
      [req.params.contentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 작성
app.post('/api/comments', authenticateToken, async (req, res) => {
  const { content_id, nickname, body } = req.body;
  if (!content_id || !body || !body.trim()) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO comments (content_id, user_id, nickname, body) VALUES (?, ?, ?, ?)',
      [content_id, req.user.id, nickname || '익명', body.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 수정
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ message: '내용을 입력해주세요.' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    await pool.query('UPDATE comments SET body = ? WHERE id = ?', [body.trim(), req.params.id]);
    const [updated] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 삭제
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
