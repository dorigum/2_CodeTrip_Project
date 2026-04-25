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

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected');
    
    await conn.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, profile_img VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await conn.query('CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, content_id VARCHAR(50) NOT NULL, user_id INT, nickname VARCHAR(100) NOT NULL DEFAULT "익명", body TEXT NOT NULL, likes INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_content_id (content_id))');
    await conn.query('CREATE TABLE IF NOT EXISTS comment_likes (id INT AUTO_INCREMENT PRIMARY KEY, comment_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_comment_user (comment_id, user_id))');
    
    // Wishlist Table with Title/Image Fallback
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content_id VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        image_url TEXT,
        folder_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_content (user_id, content_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlist_folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables initialized');
    conn.release();
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
  }
};
initDB();

let allTravelItems = null;
let mainTopImages = null;

const initTravelCache = async () => {
  try {
    console.log('⏳ Loading Travel Cache...');
    const result = await fetchCombination({ region: '', theme: '', keyword: '', numOfRows: 60000, arrange: 'O' });
    allTravelItems = result.items;
    mainTopImages = allTravelItems.filter(item => item.firstimage).slice(0, 100).map(item => ({ id: item.contentid, title: item.title, image: item.firstimage }));
    console.log(`✅ Cached ${allTravelItems.length} items`);
  } catch (err) { console.error('❌ Cache failed:', err.message); }
};
initTravelCache();

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
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
    res.status(201).json({ message: 'Success' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) return res.status(401).json({ message: 'Invalid credentials' });
    const user = users[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, profileImg: user.profile_img } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Travel API Routes ---
app.get('/api/travel/random', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });
  const filtered = allTravelItems.filter(item => item.firstimage && String(item.contenttypeid) === '12');
  res.json(filtered.sort(() => 0.5 - Math.random()).slice(0, 30));
});

app.get('/api/travel', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });
  const pageNo = parseInt(req.query.pageNo) || 1;
  const numOfRows = parseInt(req.query.numOfRows) || 10;
  const keyword = (req.query.keyword || '').toLowerCase();
  const regions = (req.query.regions || '').split(',').filter(Boolean);
  const themes = (req.query.themes || '').split(',').filter(Boolean);

  let filtered = allTravelItems;
  if (regions.length) filtered = filtered.filter(item => regions.includes(item.lDongRegnCd));
  if (themes.length) filtered = filtered.filter(item => themes.includes(String(item.contenttypeid)));
  if (keyword) filtered = filtered.filter(item => item.title?.toLowerCase().includes(keyword));

  res.json({ items: filtered.slice((pageNo - 1) * numOfRows, pageNo * numOfRows), totalCount: filtered.length });
});

// --- Wishlist Core Routes (FIXED) ---

app.get('/api/wishlist/details', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT content_id as contentId, title, image_url as imageUrl, folder_id FROM wishlists WHERE user_id = ?', [req.user.id]);
    const details = rows.map(row => {
      const dbId = String(row.contentId);
      const cached = allTravelItems?.find(item => String(item.contentid || item.contentId) === dbId);
      return {
        ...(cached || {}),
        contentid: dbId,
        title: row.title || cached?.title || '여행지',
        firstimage: row.imageUrl || cached?.firstimage || '',
        folder_id: row.folder_id,
        addr1: cached?.addr1 || '정보 없음'
      };
    });
    res.json(details);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
  const { contentId, title, imageUrl, folderId } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM wishlists WHERE user_id = ? AND content_id = ?', [req.user.id, contentId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
      res.json({ wishlisted: false });
    } else {
      await pool.query('INSERT INTO wishlists (user_id, content_id, title, image_url, folder_id) VALUES (?, ?, ?, ?, ?)', [req.user.id, contentId, title, imageUrl, folderId]);
      res.json({ wishlisted: true });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/wishlist/folders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wishlist_folders WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/wishlist/folders', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO wishlist_folders (user_id, name) VALUES (?, ?)', [req.user.id, req.body.name]);
    res.status(201).json({ id: result.insertId, name: req.body.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/wishlist/folders/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE wishlists SET folder_id = NULL WHERE folder_id = ?', [req.params.id]);
    await pool.query('DELETE FROM wishlist_folders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/wishlist/move', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE wishlists SET folder_id = ? WHERE content_id = ? AND user_id = ?', [req.body.folderId, req.body.contentId, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
