const { fetchCombination, fetchFestivals } = require('./tourApiService');

let allTravelItems = null;
let sortedTravelItems = {};
let travelTitleMap = new Map();
let mainTopImages = null;
let festivalItems = null;

const REGION_NAMES = {
  '11': '서울', '26': '부산', '27': '대구', '28': '인천',
  '29': '광주', '30': '대전', '31': '울산', '36110': '세종',
  '41': '경기', '43': '충북', '44': '충남', '46': '전남',
  '47': '경북', '48': '경남', '50': '제주', '51': '강원', '52': '전북',
};

const compareByField = (field, desc) => (a, b) => {
  const va = String(a[field] || '0');
  const vb = String(b[field] || '0');
  return desc ? vb.localeCompare(va) : va.localeCompare(vb);
};

const applyCache = (items, festivals) => {
  allTravelItems = items;
  sortedTravelItems = {
    createdtime_desc: [...items].sort(compareByField('createdtime', true)),
    createdtime_asc: [...items].sort(compareByField('createdtime', false)),
    modifiedtime_desc: [...items].sort(compareByField('modifiedtime', true)),
    modifiedtime_asc: [...items].sort(compareByField('modifiedtime', false)),
  };
  travelTitleMap = new Map(
    items.map(item => [String(item.contentid || item.contentId), item.title || ''])
  );
  mainTopImages = items
    .filter(item => item.firstimage)
    .slice(0, 100)
    .map(item => ({ id: item.contentid, title: item.title, image: item.firstimage }));
  festivalItems = festivals.map(f => ({
    ...f,
    eventstartdate: String(f.eventstartdate || f.eventStartDate || ''),
  }));
};

const createNotifications = async (pool, newItems) => {
  try {
    const byRegion = {};
    for (const item of newItems) {
      const code = String(item.lDongRegnCd || '');
      if (!code || !REGION_NAMES[code]) continue;
      if (!byRegion[code]) byRegion[code] = [];
      byRegion[code].push(item);
    }

    if (Object.keys(byRegion).length === 0) return;

    // find users interested in those regions
    const codes = Object.keys(byRegion);
    const [rows] = await pool.query(
      `SELECT user_id, region_code FROM user_favorite_regions WHERE region_code IN (${codes.map(() => '?').join(',')})`,
      codes
    );

    if (rows.length === 0) return;

    const notifications = [];
    for (const { user_id, region_code } of rows) {
      const items = byRegion[region_code];
      const regionName = REGION_NAMES[region_code];
      for (const item of items) {
        const title = item.title || '새 여행지';
        const contentId = String(item.contentid || item.contentId || '');
        notifications.push([
          user_id,
          `${regionName} 지역에 새로운 여행지 '${title}'가 추가되었습니다.`,
          contentId || null,
        ]);
      }
    }

    if (notifications.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, message, content_id) VALUES ?',
        [notifications]
      );
      console.log(`[Notification] Created ${notifications.length} notifications`);
    }
  } catch (err) {
    console.error('[Notification] Failed to create notifications:', err.message);
  }
};

const initTravelCache = async () => {
  try {
    console.log('Travel cache loading started');
    const result = await fetchCombination({
      region: '', theme: '', keyword: '', numOfRows: 60000, arrange: 'O',
    });
    const festivals = await fetchFestivals(2000);
    applyCache(result.items, festivals);
    console.log(`Travel cache loaded: ${allTravelItems.length} travel items, ${festivalItems.length} festivals`);
  } catch (err) {
    console.error('Travel cache loading failed:', err.message);
  }
};

const refreshTravelCache = async (pool) => {
  try {
    console.log('[Daily] Travel cache refresh started');

    const oldContentIds = allTravelItems
      ? new Set(allTravelItems.map(item => String(item.contentid || item.contentId)))
      : null;

    const result = await fetchCombination({
      region: '', theme: '', keyword: '', numOfRows: 60000, arrange: 'O',
    });
    const festivals = await fetchFestivals(2000);

    if (oldContentIds && pool) {
      const addedItems = result.items.filter(item => {
        const id = String(item.contentid || item.contentId);
        return !oldContentIds.has(id);
      });
      if (addedItems.length > 0) {
        console.log(`[Daily] ${addedItems.length} new travel items detected`);
        await createNotifications(pool, addedItems);
      }
    }

    applyCache(result.items, festivals);
    console.log(`[Daily] Travel cache refreshed: ${allTravelItems.length} items`);
  } catch (err) {
    console.error('[Daily] Travel cache refresh failed:', err.message);
  }
};

const scheduleDailyRefresh = (pool) => {
  const now = new Date();
  const next3am = new Date(now);
  next3am.setHours(3, 0, 0, 0);
  if (next3am <= now) next3am.setDate(next3am.getDate() + 1);

  const msUntil3am = next3am - now;
  setTimeout(() => {
    refreshTravelCache(pool);
    setInterval(() => refreshTravelCache(pool), 24 * 60 * 60 * 1000);
  }, msUntil3am);

  console.log(`Next travel cache refresh: ${next3am.toLocaleString('ko-KR')}`);
};

const getCache = () => ({
  allTravelItems,
  sortedTravelItems,
  travelTitleMap,
  mainTopImages,
  festivalItems,
});

module.exports = {
  getCache,
  initTravelCache,
  scheduleDailyRefresh,
};
