const { fetchCombination, fetchFestivals } = require('./tourApiService');

let allTravelItems = null;
let sortedTravelItems = {};
let travelTitleMap = new Map();
let mainTopImages = null;
let festivalItems = null;

const compareByField = (field, desc) => (a, b) => {
  const va = String(a[field] || '0');
  const vb = String(b[field] || '0');
  return desc ? vb.localeCompare(va) : va.localeCompare(vb);
};

const initTravelCache = async () => {
  try {
    console.log('Travel cache loading started');
    const result = await fetchCombination({
      region: '',
      theme: '',
      keyword: '',
      numOfRows: 60000,
      arrange: 'O',
    });

    allTravelItems = result.items;
    sortedTravelItems = {
      createdtime_desc: [...allTravelItems].sort(compareByField('createdtime', true)),
      createdtime_asc: [...allTravelItems].sort(compareByField('createdtime', false)),
      modifiedtime_desc: [...allTravelItems].sort(compareByField('modifiedtime', true)),
      modifiedtime_asc: [...allTravelItems].sort(compareByField('modifiedtime', false)),
    };
    travelTitleMap = new Map(
      allTravelItems.map(item => [String(item.contentid || item.contentId), item.title || ''])
    );
    mainTopImages = allTravelItems
      .filter(item => item.firstimage)
      .slice(0, 100)
      .map(item => ({ id: item.contentid, title: item.title, image: item.firstimage }));

    const directFestivals = await fetchFestivals(2000);
    festivalItems = directFestivals.map(f => ({
      ...f,
      eventstartdate: String(f.eventstartdate || f.eventStartDate || ''),
    }));

    console.log(`Travel cache loaded: ${allTravelItems.length} travel items, ${festivalItems.length} festivals`);
  } catch (err) {
    console.error('Travel cache loading failed:', err.message);
  }
};

const scheduleDailyRefresh = () => {
  const now = new Date();
  const next3am = new Date(now);
  next3am.setHours(3, 0, 0, 0);
  if (next3am <= now) next3am.setDate(next3am.getDate() + 1);

  const msUntil3am = next3am - now;
  setTimeout(() => {
    console.log('[Daily] Travel cache refresh started');
    initTravelCache();
    setInterval(() => {
      console.log('[Daily] Travel cache refresh started');
      initTravelCache();
    }, 24 * 60 * 60 * 1000);
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
