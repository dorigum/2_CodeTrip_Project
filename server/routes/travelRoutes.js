const axios = require('axios');
const express = require('express');
const { TRAVEL_API_BASE, TRAVEL_SERVICE_KEY } = require('../config/env');

const AREA_NAME_MAP = {
  '11': '서울', '26': '부산', '27': '대구', '28': '인천',
  '29': '광주', '30': '대전', '31': '울산', '36110': '세종',
  '41': '경기', '43': '충북', '44': '충남', '46': '전남',
  '47': '경북', '48': '경남', '50': '제주', '51': '강원', '52': '전북',
};

const createTravelRouter = ({ travelCache }) => {
  const router = express.Router();
  const proxyCache = new Map();
  const CACHE_TTL = 1000 * 60 * 60 * 2;
  const BLOCK_TTL = 1000 * 10;

  let isApiBlocked = false;
  let blockTimeout = null;

  router.get('/travel/top-images', (req, res) => {
    const { mainTopImages } = travelCache.getCache();
    if (!mainTopImages) return res.status(503).json({ message: 'Loading...' });
    res.json(mainTopImages);
  });

  router.get('/travel/near', (req, res) => {
    const { allTravelItems } = travelCache.getCache();
    if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });

    const lDongRegnCd = String(req.query.lDongRegnCd || '11');
    const targetName = AREA_NAME_MAP[lDongRegnCd] || '';
    const filtered = allTravelItems.filter(item => {
      const itemLDongRegnCd = String(item.lDongRegnCd || '');
      const isCodeMatch = itemLDongRegnCd === lDongRegnCd;
      const isAddrMatch = targetName && item.addr1?.includes(targetName);
      const typeId = String(item.contenttypeid || item.contentTypeId || '');
      return (isCodeMatch || isAddrMatch) && item.firstimage && ['12', '14'].includes(typeId);
    }).slice(0, 30);

    res.json(filtered);
  });

  router.get('/travel/festivals', (req, res) => {
    const { festivalItems } = travelCache.getCache();
    if (!festivalItems) return res.status(503).json({ message: 'Loading...' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const sort = req.query.sort || 'default';
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
    res.json({
      items: list.slice(startIndex, startIndex + limit),
      totalCount: list.length,
      currentPage: page,
      totalPages: Math.ceil(list.length / limit),
    });
  });

  router.get('/travel/random', (req, res) => {
    const { allTravelItems } = travelCache.getCache();
    if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });

    const filtered = allTravelItems.filter(item => {
      const typeId = String(item.contenttypeid || item.contentTypeId || '');
      return item.firstimage && typeId === '12';
    });
    res.json(filtered.sort(() => 0.5 - Math.random()).slice(0, 30));
  });

  router.get('/travel/proxy/:service', async (req, res) => {
    const { service } = req.params;
    const cacheKey = `${service}_${JSON.stringify(req.query)}`;

    if (isApiBlocked) {
      return res.status(429).json({ error: 'API Temporary Blocked due to rate limit. Please try again in 30s.' });
    }

    if (proxyCache.has(cacheKey)) {
      const cached = proxyCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
      proxyCache.delete(cacheKey);
    }

    const usesKorService1 = service === 'searchFestival2';
    const apiBase = usesKorService1
      ? 'https://apis.data.go.kr/B551011/KorService1'
      : TRAVEL_API_BASE;

    try {
      const response = await axios.get(`${apiBase}/${service}`, {
        params: {
          serviceKey: TRAVEL_SERVICE_KEY,
          MobileOS: 'ETC',
          MobileApp: 'CodeTrip',
          _type: 'json',
          ...req.query,
        },
        timeout: 5000,
      });

      if (response.data?.response?.header?.resultCode === '0000') {
        proxyCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }

      res.json(response.data);
    } catch (err) {
      if (err.response?.status === 429) {
        console.error('[TourAPI] 429 limit reached. Blocking requests briefly.');
        isApiBlocked = true;
        if (blockTimeout) clearTimeout(blockTimeout);
        blockTimeout = setTimeout(() => {
          isApiBlocked = false;
        }, BLOCK_TTL);
      }

      console.error(`[Proxy Error] ${service}:`, err.message);
      res.status(err.response?.status || 500).json({ error: 'Failed to fetch data from TourAPI' });
    }
  });

  router.get('/travel', (req, res) => {
    const { allTravelItems, sortedTravelItems } = travelCache.getCache();
    if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });

    const pageNo = parseInt(req.query.pageNo) || 1;
    const numOfRows = parseInt(req.query.numOfRows) || 10;
    const keyword = (req.query.keyword || '').toLowerCase();
    const regions = (req.query.regions || '').split(',').filter(Boolean);
    const themes = (req.query.themes || '').split(',').filter(Boolean);
    const sort = req.query.sort || 'default';

    const base = sortedTravelItems[sort] ?? allTravelItems;
    let filtered = base;
    if (regions.length) {
      filtered = filtered.filter(item => regions.includes(String(item.lDongRegnCd || '')));
    }
    if (themes.length) {
      filtered = filtered.filter(item => {
        const typeId = String(item.contenttypeid || item.contentTypeId || '');
        return themes.includes(typeId);
      });
    }
    if (keyword) filtered = filtered.filter(item => item.title?.toLowerCase().includes(keyword));

    res.json({
      items: filtered.slice((pageNo - 1) * numOfRows, pageNo * numOfRows),
      totalCount: filtered.length,
    });
  });

  return router;
};

module.exports = createTravelRouter;
