const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const TRAVEL_API_BASE = 'https://apis.data.go.kr/B551011/KorService2';
const TRAVEL_SERVICE_KEY = decodeURIComponent(
  process.env.TRAVEL_INFO_API_KEY
);

const fetchCombination = async ({ region, theme, keyword, numOfRows, pageNo, arrange }) => {
  const endpoint = keyword ? 'searchKeyword2' : 'areaBasedList2';
  const params = {
    serviceKey: TRAVEL_SERVICE_KEY,
    numOfRows,
    pageNo,
    MobileOS: 'ETC',
    MobileApp: 'CodeTrip',
    _type: 'json',
    arrange: arrange || 'O',
  };
  if (keyword) params.keyword = keyword;
  if (theme) params.contentTypeId = theme;
  if (region) params.lDongRegnCd = region;

  try {
    const response = await axios.get(`${TRAVEL_API_BASE}/${endpoint}`, { params });
    const body = response.data?.response?.body;
    const rawItems = body?.items?.item;
    const list = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
    return {
      items: list.map(item => ({
        ...item,
        firstimage: (item.firstimage || item.originimgurl || '')?.replace('http://', 'https://'),
      })),
      totalCount: Number(body?.totalCount || 0),
    };
  } catch {
    return { items: [], totalCount: 0 };
  }
};

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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_comment_user (comment_id, user_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_content (user_id, content_id)
      )
    `);

    console.log('✅ Tables initialized');
    conn.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
};
initDB();

// 서버 시작 시 전체 여행 데이터를 한 번 캐싱 (이후 모든 필터는 인메모리 처리)
let allTravelItems = null;
let mainTopImages = null; // 메인 슬라이더용 캐시

const initTravelCache = async () => {
  try {
    console.log('⏳ 전체 여행 데이터 로딩 중...');
    const result = await fetchCombination({
      region: '', theme: '', keyword: '', numOfRows: 60000, arrange: 'O',
    });
    allTravelItems = result.items;
    console.log(`✅ 여행 데이터 캐시 완료: ${allTravelItems.length}건`);

    // 메인 슬라이더용 사진 캐싱 (관광사진정보서비스 대신 캐시된 데이터 중 이미지가 있는 것들 활용)
    mainTopImages = allTravelItems
      .filter(item => item.firstimage)
      .slice(0, 100) // 상위 100개 추출
      .map(item => ({
        id: item.contentid,
        title: item.title,
        image: item.firstimage
      }));
    console.log(`✅ 메인 사진 캐시 완료: ${mainTopImages.length}건`);
  } catch (err) {
    console.error('❌ 여행 데이터 캐시 실패:', err.message);
  }
};
initTravelCache();

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

// --- Travel API Routes (캐시 활용 버전) ---

// 1. 메인 슬라이더 사진 목록
app.get('/api/travel/top-images', (req, res) => {
  if (!mainTopImages) return res.status(503).json({ message: '데이터 로딩 중입니다.' });
  // 무작위로 20개 섞어서 반환
  const shuffled = [...mainTopImages].sort(() => 0.5 - Math.random()).slice(0, 20);
  res.json(shuffled);
});

// 2. 지역 기반 추천 (Near Me)
app.get('/api/travel/near', (req, res) => {
  const { areaCode } = req.query;
  if (!allTravelItems) return res.status(503).json({ message: '데이터 로딩 중입니다.' });
  
  let filtered = allTravelItems.filter(item => item.firstimage); // 이미지가 있는 것만
  if (areaCode) {
    filtered = filtered.filter(item => String(item.areacode) === String(areaCode));
  }
  
  const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 10);
  res.json(shuffled);
});

// 3. 랜덤 픽 (Random Pick)
app.get('/api/travel/random', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: '데이터 로딩 중입니다.' });
  const hasImage = allTravelItems.filter(item => item.firstimage);
  const randomItems = hasImage.sort(() => 0.5 - Math.random()).slice(0, 30);
  res.json(randomItems);
});

// 4. 기존 필터링 검색
app.get('/api/travel', async (req, res) => {
  try {
    if (!allTravelItems) {
      return res.status(503).json({ message: '데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.' });
    }

    const pageNo = Math.max(1, parseInt(req.query.pageNo) || 1);
    const numOfRows = Math.max(1, parseInt(req.query.numOfRows) || 10);
    const keyword = (req.query.keyword || '').trim();

    const regions = (req.query.regions || '').split(',').map(r => r.trim());
    const themes = (req.query.themes || '').split(',').map(t => t.trim());

    let filtered = allTravelItems;

    if (!regions.includes('')) {
      const regionSet = new Set(regions);
      filtered = filtered.filter(item => regionSet.has(item.lDongRegnCd));
    }

    if (!themes.includes('')) {
      const themeSet = new Set(themes);
      filtered = filtered.filter(item => themeSet.has(String(item.contenttypeid)));
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(item => item.title?.toLowerCase().includes(lower));
    }

    const totalCount = filtered.length;
    const start = (pageNo - 1) * numOfRows;
    const items = filtered.slice(start, start + numOfRows);

    res.json({ items, totalCount });
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

// --- Comment Routes ---

// ... (기존 코멘트 라우트 생략 없이 유지됨)

// --- Wishlist Routes ---

// 위시리스트 토글 (추가/삭제)
app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) {
    return res.status(400).json({ message: 'contentId가 필요합니다.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = ? AND content_id = ?',
      [userId, contentId]
    );

    if (existing.length > 0) {
      // 이미 있으면 삭제
      await pool.query('DELETE FROM wishlists WHERE user_id = ? AND content_id = ?', [userId, contentId]);
      res.json({ wishlisted: false, message: '위시리스트에서 제거되었습니다.' });
    } else {
      // 없으면 추가
      await pool.query('INSERT INTO wishlists (user_id, content_id) VALUES (?, ?)', [userId, contentId]);
      res.json({ wishlisted: true, message: '위시리스트에 추가되었습니다.' });
    }
  } catch (err) {
    console.error('Wishlist Toggle Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 로그인한 유저의 위시리스트 content_id 목록 조회
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query('SELECT content_id FROM wishlists WHERE user_id = ?', [userId]);
    res.json(rows.map(row => row.content_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 로그인한 유저의 위시리스트 상세 정보 조회 (캐시된 데이터와 결합)
app.get('/api/wishlist/details', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query('SELECT content_id FROM wishlists WHERE user_id = ?', [userId]);
    const wishContentIds = new Set(rows.map(row => String(row.content_id)));

    if (!allTravelItems) {
      return res.status(503).json({ message: '데이터 로딩 중입니다.' });
    }

    const details = allTravelItems.filter(item => wishContentIds.has(String(item.contentid)));
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
