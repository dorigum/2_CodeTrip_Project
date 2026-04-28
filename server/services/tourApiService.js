const axios = require('axios');
const { TRAVEL_API_BASE, TRAVEL_SERVICE_KEY } = require('../config/env');

const normalizeItems = (rawItems) => {
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
};

const normalizeImageUrl = (url = '') => url.replace('http://', 'https://');

const getCaseInsensitiveField = (obj, target) => {
  const key = Object.keys(obj).find(k => k.toLowerCase() === target.toLowerCase());
  return key ? obj[key] : undefined;
};

const fetchCombination = async ({ region, theme, keyword, numOfRows, pageNo = 1, arrange }) => {
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
    const list = normalizeItems(body?.items?.item);

    return {
      items: list.map(item => ({
        ...item,
        firstimage: normalizeImageUrl(item.firstimage || item.originimgurl || ''),
      })),
      totalCount: Number(body?.totalCount || 0),
    };
  } catch (err) {
    console.error(`[fetchCombination] ${err.message}`);
    return { items: [], totalCount: 0 };
  }
};

const fetchFestivals = async (numOfRows = 1000) => {
  const params = {
    serviceKey: TRAVEL_SERVICE_KEY,
    numOfRows,
    pageNo: 1,
    MobileOS: 'ETC',
    MobileApp: 'CodeTrip',
    _type: 'json',
    arrange: 'O',
    eventStartDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
  };

  try {
    console.log('Festival data request started (searchFestival2)');
    const response = await axios.get(`${TRAVEL_API_BASE}/searchFestival2`, { params });
    const body = response.data?.response?.body;
    const list = normalizeItems(body?.items?.item);

    console.log(`Festival API response: ${list.length} items`);

    return list.map(item => ({
      ...item,
      contentid: getCaseInsensitiveField(item, 'contentid') || getCaseInsensitiveField(item, 'contentId'),
      title: getCaseInsensitiveField(item, 'title'),
      firstimage: normalizeImageUrl(
        getCaseInsensitiveField(item, 'firstimage') || getCaseInsensitiveField(item, 'originimgurl') || ''
      ),
      eventstartdate: String(
        getCaseInsensitiveField(item, 'eventstartdate') || getCaseInsensitiveField(item, 'eventStartDate') || ''
      ),
      eventenddate: String(
        getCaseInsensitiveField(item, 'eventenddate') || getCaseInsensitiveField(item, 'eventEndDate') || ''
      ),
      addr1: getCaseInsensitiveField(item, 'addr1'),
      areacode: getCaseInsensitiveField(item, 'areacode') || getCaseInsensitiveField(item, 'areaCode'),
    }));
  } catch (err) {
    console.error(`[fetchFestivals] ${err.response?.status || err.message}`);
    return [];
  }
};

module.exports = {
  fetchCombination,
  fetchFestivals,
  normalizeImageUrl,
};
