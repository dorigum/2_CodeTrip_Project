const axios = require('axios');
const express = require('express');
const { TRAVEL_API_BASE, TRAVEL_SERVICE_KEY } = require('../config/env');

const AREA_NAME_MAP = {
  '11': '서울', '26': '부산', '27': '대구', '28': '인천',
  '29': '광주', '30': '대전', '31': '울산', '36110': '세종',
  '41': '경기', '43': '충북', '44': '충남', '46': '전남',
  '47': '경북', '48': '경남', '50': '제주', '51': '강원', '52': '전북',
};

const REGION_META = {
  11: { name: '서울', areaCode: '1', lat: 37.5665, lon: 126.9780 },
  26: { name: '부산', areaCode: '6', lat: 35.1796, lon: 129.0756 },
  27: { name: '대구', areaCode: '4', lat: 35.8714, lon: 128.6014 },
  28: { name: '인천', areaCode: '2', lat: 37.4563, lon: 126.7052 },
  29: { name: '광주', areaCode: '5', lat: 35.1595, lon: 126.8526 },
  30: { name: '대전', areaCode: '3', lat: 36.3504, lon: 127.3845 },
  31: { name: '울산', areaCode: '7', lat: 35.5384, lon: 129.3114 },
  41: { name: '경기', areaCode: '31', lat: 37.4138, lon: 127.5183 },
  43: { name: '충북', areaCode: '33', lat: 36.8, lon: 127.7 },
  44: { name: '충남', areaCode: '34', lat: 36.5184, lon: 126.8 },
  46: { name: '전남', areaCode: '38', lat: 34.8679, lon: 126.991 },
  47: { name: '경북', areaCode: '35', lat: 36.4919, lon: 128.8889 },
  48: { name: '경남', areaCode: '36', lat: 35.4606, lon: 128.2132 },
  50: { name: '제주', areaCode: '39', lat: 33.4996, lon: 126.5312 },
  51: { name: '강원', areaCode: '32', lat: 37.8228, lon: 128.1555 },
  52: { name: '전북', areaCode: '37', lat: 35.7175, lon: 127.153 },
  36110: { name: '세종', areaCode: '8', lat: 36.4801, lon: 127.289 },
};

const WEATHER_KEYWORDS = {
  Sunny: ['해변', '바다', '공원', '산책', '전망대', '정원', '섬', '수목원'],
  Clear: ['해변', '바다', '공원', '산책', '전망대', '정원', '섬', '수목원'],
  'Partly Cloudy': ['공원', '산책', '전망대', '정원', '카페', '거리'],
  Cloudy: ['박물관', '미술관', '전시', '문화', '카페', '시장'],
  Rainy: ['박물관', '미술관', '전시', '문화', '아쿠아리움', '실내'],
  Snowy: ['박물관', '미술관', '전시', '온천', '카페', '시장'],
  Stormy: ['박물관', '미술관', '전시', '문화', '실내'],
};

const parseWeatherCode = (code, cloudcover = 0, precipitation = 0) => {
  let effectiveCode = Number(code);
  if (precipitation > 0 && effectiveCode < 51) effectiveCode = 61;
  if ((effectiveCode === 0 || effectiveCode === 1) && cloudcover >= 75) effectiveCode = 3;
  if (effectiveCode === 0 && cloudcover >= 40) effectiveCode = 2;

  if (effectiveCode === 0) return { label: 'Sunny', icon: 'sunny' };
  if (effectiveCode === 1 || effectiveCode === 2) return { label: 'Partly Cloudy', icon: 'partly_cloudy_day' };
  if (effectiveCode === 3) return { label: 'Cloudy', icon: 'cloud' };
  if ((effectiveCode >= 51 && effectiveCode <= 67) || (effectiveCode >= 80 && effectiveCode <= 82)) {
    return { label: 'Rainy', icon: 'rainy' };
  }
  if ((effectiveCode >= 71 && effectiveCode <= 77) || effectiveCode === 85 || effectiveCode === 86) {
    return { label: 'Snowy', icon: 'ac_unit' };
  }
  if (effectiveCode >= 95 && effectiveCode <= 99) return { label: 'Stormy', icon: 'thunderstorm' };
  return { label: 'Clear', icon: 'sunny' };
};

const fetchRegionWeather = async (region) => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: region.lat,
        longitude: region.lon,
        current: 'temperature_2m,weathercode,cloudcover,precipitation',
        timezone: 'Asia/Seoul',
        models: 'jma_seamless',
      },
      timeout: 4000,
    });
    const current = response.data.current || {};
    return {
      temp: Math.round(current.temperature_2m ?? 24),
      ...parseWeatherCode(current.weathercode, current.cloudcover, current.precipitation),
    };
  } catch {
    return { temp: 24, label: 'Sunny', icon: 'sunny' };
  }
};

const getItemRegionCode = (item) => String(item.lDongRegnCd || item.areacode || item.areaCode || '');

const getCandidateRegionCodes = (regions) => {
  const codes = new Set();
  regions.forEach((code) => {
    codes.add(String(code));
    const meta = REGION_META[code];
    if (meta?.areaCode) codes.add(String(meta.areaCode));
  });
  return codes;
};

const getWeatherKeywords = (weather) => WEATHER_KEYWORDS[weather.label] || [];

const isWeatherMatchedItem = (item, weather) => {
  const text = `${item.title || ''} ${item.addr1 || ''}`;
  return getWeatherKeywords(weather).some(keyword => text.includes(keyword));
};

const scoreTravelItem = (item, context) => {
  const reasons = [];
  let score = 0;
  const title = item.title || '';
  const addr = item.addr1 || '';
  const text = `${title} ${addr}`;
  const typeId = String(item.contenttypeid || item.contentTypeId || '');
  const weatherKeywords = getWeatherKeywords(context.weather);

  if (item.firstimage) score += 20;
  if (typeId === '12') score += 12;
  if (typeId === '14') score += 10;

  if (weatherKeywords.some(keyword => text.includes(keyword))) {
    score += 24;
    reasons.push(`${context.region.name}의 현재 날씨와 어울리는 키워드가 포함되어 있어요.`);
  }

  if (addr.includes(context.region.name)) {
    score += 16;
    reasons.push(`관심 지역인 ${context.region.name}에 있는 여행지예요.`);
  }

  if (typeId === '15' || ['축제', '행사', '페스티벌'].some(keyword => text.includes(keyword))) {
    score -= 10;
  }

  if (!reasons.length) {
    reasons.push(`${context.region.name} 관심 지역 후보 중에서 즉흥 여행지로 추천했어요.`);
  }

  return { item, score, reasons };
};

const createTravelRouter = ({ travelCache, pool, authenticateToken }) => {
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

  router.get('/travel/spontaneous', authenticateToken, async (req, res) => {
    const { allTravelItems } = travelCache.getCache();
    if (!allTravelItems) return res.status(503).json({ message: 'Loading...' });

    try {
      const [favoriteRows] = await pool.query(
        'SELECT region_code FROM user_favorite_regions WHERE user_id = ?',
        [req.user.id]
      );
      const preferredRegions = favoriteRows.map(row => String(row.region_code));
      const hasPreferences = preferredRegions.length > 0;
      const targetRegions = preferredRegions.length ? preferredRegions : ['11'];
      const selectedRegionCode = targetRegions[Math.floor(Math.random() * targetRegions.length)];
      const region = REGION_META[selectedRegionCode] || REGION_META[11];
      const selectedRegionCodes = getCandidateRegionCodes([selectedRegionCode]);
      const preferredRegionCodes = getCandidateRegionCodes(targetRegions);
      const weather = await fetchRegionWeather(region);

      let fallbackUsed = false;
      let candidates = allTravelItems.filter(item => {
        const typeId = String(item.contenttypeid || item.contentTypeId || '');
        return item.firstimage && ['12', '14'].includes(typeId) && selectedRegionCodes.has(getItemRegionCode(item));
      });

      if (candidates.length === 0) {
        fallbackUsed = true;
        candidates = allTravelItems.filter(item => {
          const typeId = String(item.contenttypeid || item.contentTypeId || '');
          return item.firstimage && ['12', '14'].includes(typeId) && preferredRegionCodes.has(getItemRegionCode(item));
        });
      }

      if (candidates.length === 0) {
        fallbackUsed = true;
        candidates = allTravelItems.filter(item => {
          const typeId = String(item.contenttypeid || item.contentTypeId || '');
          return item.firstimage && ['12', '14'].includes(typeId);
        });
      }

      const weatherMatchedCandidates = candidates.filter(item => isWeatherMatchedItem(item, weather));
      const minWeatherCandidateCount = Math.min(5, candidates.length);
      const weatherFilterApplied = candidates.length > 0 && weatherMatchedCandidates.length >= minWeatherCandidateCount;
      if (weatherFilterApplied) {
        candidates = weatherMatchedCandidates;
      }

      const ranked = candidates
        .map(item => scoreTravelItem(item, { region, weather }))
        .sort((a, b) => b.score - a.score);

      const poolSize = Math.min(parseInt(req.query.poolSize) || 20, ranked.length);
      const topPool = ranked.slice(0, Math.max(poolSize, 1));
      const selected = topPool[Math.floor(Math.random() * topPool.length)];

      if (!selected) {
        return res.status(404).json({ message: 'No travel candidates found.' });
      }

      res.json({
        item: selected.item,
        score: selected.score,
        reasons: selected.reasons,
        weather: {
          ...weather,
          regionCode: String(selectedRegionCode),
          regionName: region.name,
        },
        hasPreferences,
        preferredRegions,
        activeRegion: String(selectedRegionCode),
        fallbackUsed,
        weatherFilter: {
          applied: weatherFilterApplied,
          matchedCount: weatherMatchedCandidates.length,
          keywords: getWeatherKeywords(weather),
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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
