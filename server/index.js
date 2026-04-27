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
  if (region) params.areaCode = region;

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
  } catch (err) {
    console.error(`❌ [fetchCombination] 오류: ${err.message}`);
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
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
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
    console.log('✅ 데이터베이스 연결 성공');
    
    await conn.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, name VARCHAR(100) NOT NULL, profile_img VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await conn.query('CREATE TABLE IF NOT EXISTS travel_comments (id INT AUTO_INCREMENT PRIMARY KEY, content_id VARCHAR(50) NOT NULL, user_id INT, nickname VARCHAR(100) NOT NULL DEFAULT "익명", body TEXT NOT NULL, likes INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_content_id (content_id))');
    await conn.query('CREATE TABLE IF NOT EXISTS travel_comment_likes (id INT AUTO_INCREMENT PRIMARY KEY, comment_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_comment_user (comment_id, user_id))');
    
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
      CREATE TABLE IF NOT EXISTS board_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nickname VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        view_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS board_post_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        content_id VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        firstimage TEXT,
        INDEX idx_board_post_tags_post_id (post_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS board_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        nickname VARCHAR(100) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_board_comments_post_id (post_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS board_comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_board_comment_user (comment_id, user_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlist_folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wishlist_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        folder_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        type ENUM('MEMO', 'CHECKLIST') DEFAULT 'CHECKLIST',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES wishlist_folders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 기존 wishlists 테이블에 누락된 컬럼 추가 (이미 존재하면 조용히 무시)
    try { await conn.query('ALTER TABLE wishlists ADD COLUMN title VARCHAR(255)'); } catch { /* column already exists */ }
    try { await conn.query('ALTER TABLE wishlists ADD COLUMN image_url TEXT'); } catch { /* column already exists */ }

    // 기존 wishlist_folders 테이블에 여행 일정 컬럼 추가 (이미 존재하면 조용히 무시)
    try { await conn.query('ALTER TABLE wishlist_folders ADD COLUMN start_date DATE NULL'); } catch { /* column already exists */ }
    try { await conn.query('ALTER TABLE wishlist_folders ADD COLUMN end_date DATE NULL'); } catch { /* column already exists */ }

    console.log('✅ 테이블 초기화 완료');
    conn.release();
  } catch (err) {
    console.error('❌ DB 초기화 실패:', err.message);
  }
};
initDB();

const fetchFestivals = async (numOfRows = 1000) => {
  const params = {
    serviceKey: TRAVEL_SERVICE_KEY,
    numOfRows,
    pageNo: 1,
    MobileOS: 'ETC',
    MobileApp: 'CodeTrip',
    _type: 'json',
    arrange: 'A',
    listYN: 'Y',
    eventStartDate: '20250101'
  };

  try {
    console.log(`📡 축제 정보 요청 중 (searchFestival2)...`);
    const response = await axios.get(`${TRAVEL_API_BASE}/searchFestival2`, { params });
    
    const body = response.data?.response?.body;
    const rawItems = body?.items?.item;
    const list = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
    
    console.log(`✅ 축제 API 응답 수: ${list.length}개`);
    
    return list.map(item => {
      const getField = (obj, target) => {
        const key = Object.keys(obj).find(k => k.toLowerCase() === target.toLowerCase());
        return key ? obj[key] : undefined;
      };

      return {
        ...item,
        contentid: getField(item, 'contentid') || getField(item, 'contentId'),
        title: getField(item, 'title'),
        firstimage: (getField(item, 'firstimage') || getField(item, 'originimgurl') || '')?.replace('http://', 'https://'),
        eventstartdate: String(getField(item, 'eventstartdate') || getField(item, 'eventStartDate') || ''), 
        eventenddate: String(getField(item, 'eventenddate') || getField(item, 'eventEndDate') || ''),     
        addr1: getField(item, 'addr1'),
        areacode: getField(item, 'areacode') || getField(item, 'areaCode')
      };
    });
  } catch (err) {
    console.error(`❌ [fetchFestivals] 에러: ${err.response?.status || err.message}`);
    return [];
  }
};

let allTravelItems = null;
let mainTopImages = null;
let festivalItems = null;

const initTravelCache = async () => {
  try {
    console.log('⏳ 여행 데이터 캐시 로딩 중...');
    const result = await fetchCombination({ region: '', theme: '', keyword: '', numOfRows: 60000, arrange: 'O' });
    allTravelItems = result.items;
    
    mainTopImages = allTravelItems
      .filter(item => item.firstimage)
      .slice(0, 100)
      .map(item => ({ id: item.contentid, title: item.title, image: item.firstimage }));

    const filteredFestivals = allTravelItems.filter(item => {
      const typeId = String(item.contenttypeid || item.contentTypeId || '');
      return item.firstimage && typeId === '15';
    });

    console.log(`⏳ 축제 전용 데이터(날짜 포함) 확보 중...`);
    const directFestivals = await fetchFestivals(2000);
    
    // 날짜 정보를 정규화하여 저장
    const normalizedDirect = directFestivals.map(f => ({
      ...f,
      eventstartdate: String(f.eventstartdate || f.eventStartDate || '')
    }));

    // 날짜가 있는 데이터를 우선적으로 배치
    const combined = [...normalizedDirect];
    const existingIds = new Set(combined.map(f => String(f.contentid)));
    
    // 날짜 정보는 없지만 일반 리스트에 있는 축제들 추가 (중복 제외)
    filteredFestivals.forEach(f => {
      const fid = String(f.contentid || f.contentId);
      if (!existingIds.has(fid)) {
        combined.push({
          ...f,
          eventstartdate: String(f.eventstartdate || f.eventStartDate || '')
        });
      }
    });

    festivalItems = combined;
    console.log(`✅ 캐시 완료: 총 ${allTravelItems.length}개 항목 (축제: ${festivalItems.length}개)`);
  } catch (err) { 
    console.error('❌ 캐시 로딩 실패:', err.message); 
  }
};
initTravelCache();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Token invalid or expired' });
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

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, name, newPassword } = req.body;
  try {
    // 이메일과 이름이 일치하는 사용자 확인
    const [users] = await pool.query('SELECT id FROM users WHERE email = ? AND name = ?', [email, name]);
    if (users.length === 0) {
      return res.status(404).json({ message: '입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.' });
    }

    // 새 비밀번호 해싱 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, users[0].id]);
    
    res.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- User Profile & Security Routes ---

// 1. 프로필 이미지 업로드 (파일 저장 후 URL 반환)
app.post('/api/user/upload', authenticateToken, upload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 프로필 정보 업데이트 (이름, 이미지 URL)
app.put('/api/user/update', authenticateToken, async (req, res) => {
  const { name, profileImg } = req.body;
  const userId = req.user.id;
  try {
    await pool.query('UPDATE users SET name = ?, profile_img = ? WHERE id = ?', [name, profileImg, userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. 비밀번호 변경
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    // 현재 비밀번호 확인
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });

    // 새 비밀번호 해싱 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Travel API Routes ---
app.get('/api/travel/top-images', (req, res) => {
  if (!mainTopImages) return res.status(503).json({ message: 'Loading...' });
  res.json(mainTopImages);
});

app.get('/api/travel/near', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });
  const areaCode = String(req.query.areaCode || '1');
  
  // 지역 코드 매핑 로직 강화: areacode 필드 뿐만 아니라 addr1의 텍스트도 보조적으로 활용
  const AREA_NAME_MAP = { '1': '서울', '31': '경기', '32': '강원', '2': '인천' }; // 예시
  const targetName = AREA_NAME_MAP[areaCode] || '';

  const filtered = allTravelItems.filter(item => {
    const itemAreaCode = String(item.areacode || item.areaCode || '');
    const isCodeMatch = itemAreaCode === areaCode;
    // 만약 코드가 없거나 안맞을 경우 addr1에 지역명이 포함되어 있는지 확인 (울산 방지)
    const isAddrMatch = targetName && item.addr1?.includes(targetName);
    
    const typeId = String(item.contenttypeid || item.contentTypeId || '');
    return (isCodeMatch || isAddrMatch) && item.firstimage && ['12', '14'].includes(typeId);
  }).slice(0, 30);
  
  console.log(`📍 Near filter: AreaCode ${areaCode} (${targetName}), Found ${filtered.length} items`);
  res.json(filtered);
});

app.get('/api/travel/festivals', (req, res) => {
  if (!festivalItems) return res.status(503).json({ message: 'Loading...' });
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const sort = req.query.sort || 'default'; 
  
  console.log(`🔍 [API] 축제 목록 요청 - 정렬: ${sort}, 페이지: ${page}`);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const getDate = (obj) => {
    const d = String(obj.eventstartdate || '').trim();
    return /^\d{8}$/.test(d) ? d : '';
  };
  const getEnd = (obj) => {
    const d = String(obj.eventenddate || '').trim();
    return /^\d{8}$/.test(d) ? d : '';
  };

  // 정렬 방식과 무관하게 종료된 축제 항상 제외
  let list = festivalItems.filter(item => {
    const end = getEnd(item);
    if (end) return end >= todayStr;
    const start = getDate(item);
    if (start) return start >= todayStr;
    return true;
  });

  if (sort === 'date_asc' || sort === 'date_desc') {
    list.sort((a, b) => {
      const da = getDate(a);
      const db = getDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return sort === 'date_asc' ? da.localeCompare(db) : db.localeCompare(da);
    });
  }

  const startIndex = (page - 1) * limit;
  const paginatedList = list.slice(startIndex, startIndex + limit);
  
  res.json({
    items: paginatedList,
    totalCount: list.length,
    currentPage: page,
    totalPages: Math.ceil(list.length / limit)
  });
});

app.get('/api/travel/random', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });

  const filtered = allTravelItems.filter(item => {
    const typeId = String(item.contenttypeid || item.contentTypeId || '');
    return item.firstimage && typeId === '12';
  });
  res.json(filtered.sort(() => 0.5 - Math.random()).slice(0, 30));
});

// --- TourAPI Proxy for Detail Info (To avoid 429 Errors) ---
app.get('/api/travel/proxy/:service', async (req, res) => {
  const { service } = req.params;
  // 서비스명에 따라 KorService2 또는 KorService1 유연하게 대응
  const apiBase = service.includes('searchFestival') ? 'https://apis.data.go.kr/B551011/KorService1' : TRAVEL_API_BASE;
  
  try {
    const response = await axios.get(`${apiBase}/${service}`, {
      params: {
        serviceKey: TRAVEL_SERVICE_KEY,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        ...req.query
      },
      timeout: 5000
    });
    res.json(response.data);
  } catch (err) {
    console.error(`❌ [Proxy Error] ${service}:`, err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch data from TourAPI' });
  }
});

app.get('/api/travel', (req, res) => {
  if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });
  const pageNo = parseInt(req.query.pageNo) || 1;
  const numOfRows = parseInt(req.query.numOfRows) || 10;
  const keyword = (req.query.keyword || '').toLowerCase();
  const regions = (req.query.regions || '').split(',').filter(Boolean);
  const themes = (req.query.themes || '').split(',').filter(Boolean);

  let filtered = allTravelItems;
  if (regions.length) filtered = filtered.filter(item => regions.includes(String(item.areacode || item.areaCode)));
  if (themes.length) filtered = filtered.filter(item => {
    const typeId = String(item.contenttypeid || item.contentTypeId || '');
    return themes.includes(typeId);
  });
  if (keyword) filtered = filtered.filter(item => item.title?.toLowerCase().includes(keyword));

  res.json({ items: filtered.slice((pageNo - 1) * numOfRows, pageNo * numOfRows), totalCount: filtered.length });
});

// --- Travel Comment Routes ---

// 코멘트 조회 (좋아요 수 + 현재 유저 좋아요 여부 포함)
app.get('/api/travel-comments/:contentId', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  if (token) {
    try { userId = jwt.verify(token, JWT_SECRET).id; } catch {}
  }

  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.content_id, c.user_id, c.nickname, c.body, c.created_at,
        COUNT(cl.id) AS likes,
        COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
      FROM travel_comments c
      LEFT JOIN travel_comment_likes cl ON cl.comment_id = c.id
      WHERE c.content_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [userId, req.params.contentId]);

    res.json(rows.map(r => ({ ...r, likes: Number(r.likes), liked: !!r.liked })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 좋아요 토글
app.post('/api/travel-comments/:id/like', authenticateToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  try {
    const [existing] = await pool.query(
      'SELECT id FROM travel_comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );
    if (existing.length > 0) {
      await pool.query('DELETE FROM travel_comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    } else {
      await pool.query('INSERT INTO travel_comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
    }
    const [[{ likes }]] = await pool.query(
      'SELECT COUNT(*) AS likes FROM travel_comment_likes WHERE comment_id = ?',
      [commentId]
    );
    res.json({ liked: existing.length === 0, likes: Number(likes) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 작성
app.post('/api/travel-comments', authenticateToken, async (req, res) => {
  const { content_id, nickname, body } = req.body;
  if (!content_id || !body || !body.trim()) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO travel_comments (content_id, user_id, nickname, body) VALUES (?, ?, ?, ?)',
      [content_id, req.user.id, nickname || '익명', body.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 수정
app.put('/api/travel-comments/:id', authenticateToken, async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ message: '내용을 입력해주세요.' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    await pool.query('UPDATE travel_comments SET body = ? WHERE id = ?', [body.trim(), req.params.id]);
    const [updated] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코멘트 삭제
app.delete('/api/travel-comments/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '코멘트를 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await pool.query('DELETE FROM travel_comments WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Board Routes ---

// --- Wishlist Core Routes ---
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
    const { name, startDate, endDate } = req.body;
    const [result] = await pool.query(
      'INSERT INTO wishlist_folders (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
      [req.user.id, name, startDate || null, endDate || null]
    );
    res.status(201).json({ id: result.insertId, name, start_date: startDate || null, end_date: endDate || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/wishlist/folders/:id', authenticateToken, async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    await pool.query(
      'UPDATE wishlist_folders SET name = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
      [name, startDate || null, endDate || null, req.params.id, req.user.id]
    );
    res.json({ id: req.params.id, name, start_date: startDate || null, end_date: endDate || null });
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

// --- Wishlist Notes Routes ---
app.get('/api/wishlist/folders/:folderId/notes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM wishlist_notes WHERE folder_id = ? AND user_id = ? ORDER BY created_at ASC',
      [req.params.folderId, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/wishlist/folders/:folderId/notes', authenticateToken, async (req, res) => {
  const { content, type } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO wishlist_notes (folder_id, user_id, content, type) VALUES (?, ?, ?, ?)',
      [req.params.folderId, req.user.id, content, type || 'CHECKLIST']
    );
    const [rows] = await pool.query('SELECT * FROM wishlist_notes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/wishlist/notes/:id/toggle', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE wishlist_notes SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/wishlist/notes/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// 게시글 목록
app.get('/api/board/posts', async (req, res) => {
  const pageNo = Math.max(1, parseInt(req.query.pageNo) || 1);
  const numOfRows = Math.max(1, parseInt(req.query.numOfRows) || 10);
  const keyword = (req.query.keyword || '').trim();
  const offset = (pageNo - 1) * numOfRows;

  try {
    const whereClause = keyword
      ? `WHERE p.title LIKE ? OR p.content LIKE ?
         OR EXISTS (SELECT 1 FROM board_post_tags t WHERE t.post_id = p.id AND t.title LIKE ?)`
      : '';
    const queryParams = keyword ? [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`] : [];

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM board_posts p ${whereClause}`,
      queryParams
    );

    const [rows] = await pool.query(`
      SELECT p.id, p.user_id, p.nickname, p.title, p.content, p.view_count, p.created_at,
        COUNT(DISTINCT c.id) AS comment_count
      FROM board_posts p
      LEFT JOIN board_comments c ON c.post_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, numOfRows, offset]);

    const postIds = rows.map(r => r.id);
    let tags = [];
    if (postIds.length > 0) {
      [tags] = await pool.query(
        `SELECT * FROM board_post_tags WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
        postIds
      );
    }

    const tagsMap = {};
    tags.forEach(t => {
      if (!tagsMap[t.post_id]) tagsMap[t.post_id] = [];
      tagsMap[t.post_id].push(t);
    });

    const posts = rows.map(r => ({
      ...r,
      comment_count: Number(r.comment_count),
      tags: tagsMap[r.id] || [],
    }));

    res.json({ posts, totalCount: Number(total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 상세
app.get('/api/board/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    await pool.query('UPDATE board_posts SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

    const [tags] = await pool.query('SELECT * FROM board_post_tags WHERE post_id = ?', [req.params.id]);

    res.json({ ...rows[0], view_count: rows[0].view_count + 1, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 게시글 작성
app.post('/api/board/posts', authenticateToken, async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
  }

  const conn = await pool.getConnection();
  try {
    const [userRows] = await conn.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const nickname = userRows[0]?.name || '익명';

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO board_posts (user_id, nickname, title, content) VALUES (?, ?, ?, ?)',
      [req.user.id, nickname, title.trim(), content.trim()]
    );
    const postId = result.insertId;

    if (tags.length > 0) {
      const tagValues = tags.map(t => [postId, t.content_id, t.title, t.firstimage || '']);
      await conn.query(
        'INSERT INTO board_post_tags (post_id, content_id, title, firstimage) VALUES ?',
        [tagValues]
      );
    }

    await conn.commit();
    res.status(201).json({ id: postId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 게시글 수정
app.put('/api/board/posts/:id', authenticateToken, async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    await conn.beginTransaction();

    await conn.query(
      'UPDATE board_posts SET title = ?, content = ? WHERE id = ?',
      [title.trim(), content.trim(), req.params.id]
    );

    await conn.query('DELETE FROM board_post_tags WHERE post_id = ?', [req.params.id]);
    if (tags.length > 0) {
      const tagValues = tags.map(t => [req.params.id, t.content_id, t.title, t.firstimage || '']);
      await conn.query(
        'INSERT INTO board_post_tags (post_id, content_id, title, firstimage) VALUES ?',
        [tagValues]
      );
    }

    await conn.commit();
    res.json({ message: '수정되었습니다.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 게시글 삭제
app.delete('/api/board/posts/:id', authenticateToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await conn.beginTransaction();
    await conn.query('DELETE FROM board_post_tags WHERE post_id = ?', [req.params.id]);
    await conn.query(`
      DELETE bcl FROM board_comment_likes bcl
      INNER JOIN board_comments bc ON bcl.comment_id = bc.id
      WHERE bc.post_id = ?
    `, [req.params.id]);
    await conn.query('DELETE FROM board_comments WHERE post_id = ?', [req.params.id]);
    await conn.query('DELETE FROM board_posts WHERE id = ?', [req.params.id]);
    await conn.commit();

    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 댓글 목록
app.get('/api/board/posts/:id/comments', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  if (token) {
    try { userId = jwt.verify(token, JWT_SECRET).id; } catch {}
  }

  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.post_id, c.user_id, c.nickname, c.body, c.created_at,
        COUNT(cl.id) AS likes,
        COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
      FROM board_comments c
      LEFT JOIN board_comment_likes cl ON cl.comment_id = c.id
      WHERE c.post_id = ?
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `, [userId, req.params.id]);

    res.json(rows.map(r => ({ ...r, likes: Number(r.likes), liked: !!r.liked })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 댓글 작성
app.post('/api/board/posts/:id/comments', authenticateToken, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' });

  try {
    const [postRows] = await pool.query('SELECT id FROM board_posts WHERE id = ?', [req.params.id]);
    if (postRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const nickname = userRows[0]?.name || '익명';

    const [result] = await pool.query(
      'INSERT INTO board_comments (post_id, user_id, nickname, body) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, nickname, body.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], likes: 0, liked: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 댓글 수정
app.put('/api/board/comments/:id', authenticateToken, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' });

  try {
    const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

    await pool.query('UPDATE board_comments SET body = ? WHERE id = ?', [body.trim(), req.params.id]);

    const [updated] = await pool.query(`
      SELECT c.*, COUNT(cl.id) AS likes,
        COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
      FROM board_comments c
      LEFT JOIN board_comment_likes cl ON cl.comment_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.user.id, req.params.id]);

    res.json({ ...updated[0], likes: Number(updated[0].likes), liked: !!updated[0].liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 댓글 삭제
app.delete('/api/board/comments/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await pool.query('DELETE FROM board_comment_likes WHERE comment_id = ?', [req.params.id]);
    await pool.query('DELETE FROM board_comments WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 댓글 좋아요 토글
app.post('/api/board/comments/:id/like', authenticateToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM board_comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );
    if (existing.length > 0) {
      await pool.query('DELETE FROM board_comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    } else {
      await pool.query('INSERT INTO board_comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
    }
    const [[{ likes }]] = await pool.query(
      'SELECT COUNT(*) AS likes FROM board_comment_likes WHERE comment_id = ?',
      [commentId]
    );
    res.json({ liked: existing.length === 0, likes: Number(likes) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
