const cors = require('cors');
const express = require('express');
const path = require('path');

const { PORT } = require('./config/env');
const pool = require('./config/db');
const { upload, uploadDir } = require('./config/upload');
const initDB = require('./db/init');
const { authenticateToken } = require('./middleware/auth');
const travelCache = require('./services/travelCache');

const createActivityRouter = require('./routes/activityRoutes');
const createAuthRouter = require('./routes/authRoutes');
const createBoardRouter = require('./routes/boardRoutes');
const createTravelCommentRouter = require('./routes/travelCommentRoutes');
const createTravelRouter = require('./routes/travelRoutes');
const createUserRouter = require('./routes/userRoutes');
const createWishlistRouter = require('./routes/wishlistRoutes');

const app = express();
const routerDeps = {
  authenticateToken,
  pool,
  travelCache,
  upload,
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(uploadDir)));

app.use('/api', createAuthRouter(routerDeps));
app.use('/api', createUserRouter(routerDeps));
app.use('/api', createTravelRouter(routerDeps));
app.use('/api', createTravelCommentRouter(routerDeps));
app.use('/api', createWishlistRouter(routerDeps));
app.use('/api', createActivityRouter(routerDeps));
app.use('/api', createBoardRouter(routerDeps));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

initDB(pool);
travelCache.initTravelCache();
travelCache.scheduleDailyRefresh();

app.listen(PORT, () => console.log(`Server on ${PORT}`));
