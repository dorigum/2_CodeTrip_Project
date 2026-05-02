import axios from 'axios';
import { cachedApiRequest } from './apiCache';
import authApi from './authApi';
import { getTravelInfo, getTravelInfoByKeyword } from './travelInfoApi';

const PHOTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const GALLERY_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY || '');
const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_KEYWORD = '\uC5EC\uD589';
const DEFAULT_REGION_CODE = '11';
const REGION_CODE_BY_NAME = [
  ['\uC11C\uC6B8', '11'],
  ['\uBD80\uC0B0', '26'],
  ['\uB300\uAD6C', '27'],
  ['\uC778\uCC9C', '28'],
  ['\uAD11\uC8FC', '29'],
  ['\uB300\uC804', '30'],
  ['\uC6B8\uC0B0', '31'],
  ['\uACBD\uAE30', '41'],
  ['\uCDA9\uCCAD\uBD81', '43'],
  ['\uCDA9\uBD81', '43'],
  ['\uCDA9\uCCAD\uB0A8', '44'],
  ['\uCDA9\uB0A8', '44'],
  ['\uC804\uBD81', '52'],
  ['\uC804\uB77C\uBD81', '52'],
  ['\uC804\uB0A8', '46'],
  ['\uC804\uB77C\uB0A8', '46'],
  ['\uACBD\uBD81', '47'],
  ['\uACBD\uC0C1\uBD81', '47'],
  ['\uACBD\uB0A8', '48'],
  ['\uACBD\uC0C1\uB0A8', '48'],
  ['\uC81C\uC8FC', '50'],
  ['\uAC15\uC6D0', '51'],
  ['\uC138\uC885', '36110'],
];

const normalizeImage = (url) => url?.replace('http://', 'https://') || '';

const toRegionCode = (region) => {
  const value = String(region || '').trim();
  if (!value) return DEFAULT_REGION_CODE;
  if (/^\d+$/.test(value)) return value;
  return REGION_CODE_BY_NAME.find(([name]) => value.includes(name))?.[1] || DEFAULT_REGION_CODE;
};

const fetchGallery = async (service, params = {}) => {
  const requestParams = {
    serviceKey: GALLERY_KEY,
    MobileOS: 'ETC',
    MobileApp: 'CodeTrip',
    _type: 'json',
    ...params,
  };

  return cachedApiRequest({
    scope: 'gallery',
    service,
    params: requestParams,
    ttlMs: DAY,
    fetcher: async () => {
      const response = await axios.get(`${PHOTO_BASE_URL}/${service}`, {
        params: requestParams,
      });
      return response.data;
    },
  });
};

const normalizeItems = (items) => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map((item) => ({
    ...item,
    firstimage: normalizeImage(item.firstimage || item.originimgurl || item.galWebImageUrl),
    galWebImageUrl: normalizeImage(item.galWebImageUrl),
  }));
};

export const getPhotoList = async () => {
  try {
    const data = await fetchGallery('galleryList1', { numOfRows: 12, pageNo: 1, arrange: 'A' });
    return normalizeItems(data?.response?.body?.items?.item);
  } catch (error) {
    console.error('Photo API error:', error);
    return [];
  }
};

export const getCityBasedPlaces = async (areaCode) => {
  try {
    const { items } = await getTravelInfo({ pageNo: 1, numOfRows: 8, lDongRegnCd: toRegionCode(areaCode) });
    return items;
  } catch (error) {
    console.error('City based places error:', error);
    return [];
  }
};

export const searchKeywordPlaces = async (keyword = DEFAULT_KEYWORD, pageNo = 1, lDongRegnCd) => {
  try {
    const { items } = await getTravelInfoByKeyword({
      keyword: keyword || DEFAULT_KEYWORD,
      pageNo,
      numOfRows: 20,
      lDongRegnCd,
    });
    return items;
  } catch {
    return [];
  }
};

export const getSpontaneousTravel = async (weatherKeyword = DEFAULT_KEYWORD, poolSize = 20) => {
  let favoriteRegions = [];
  try {
    favoriteRegions = await authApi.getFavoriteRegions();
  } catch {
    favoriteRegions = [];
  }

  const hasPreferences = favoriteRegions.length > 0;
  const selectedRegion = hasPreferences
    ? String(favoriteRegions[Math.floor(Math.random() * favoriteRegions.length)])
    : DEFAULT_REGION_CODE;
  const keyword = weatherKeyword || DEFAULT_KEYWORD;

  let items = await searchKeywordPlaces(keyword, 1, selectedRegion);
  if (!items.length && keyword !== DEFAULT_KEYWORD) {
    items = await searchKeywordPlaces(DEFAULT_KEYWORD, 1, selectedRegion);
  }
  if (!items.length) {
    items = await searchKeywordPlaces(DEFAULT_KEYWORD, 1);
  }
  if (!items.length) return null;

  return {
    item: items[Math.floor(Math.random() * Math.min(items.length, poolSize))],
    hasPreferences,
    regionCode: selectedRegion,
    reasons: [
      hasPreferences
        ? '\uC124\uC815\uD55C \uC120\uD638 \uC9C0\uC5ED\uC744 \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4.'
        : '\uC120\uD638 \uC9C0\uC5ED\uC774 \uC5C6\uC5B4 \uAE30\uBCF8 \uC9C0\uC5ED\uC73C\uB85C \uCD94\uCC9C\uD588\uC2B5\uB2C8\uB2E4.',
      `\uD604\uC7AC \uB0A0\uC528 \uD0A4\uC6CC\uB4DC "${keyword}"\uB97C \uD65C\uC6A9\uD588\uC2B5\uB2C8\uB2E4.`,
    ],
  };
};

export const getFestivalList = async (page = 1, limit = 8, sort = 'default') => {
  const { items, totalCount } = await getTravelInfo({ pageNo: page, numOfRows: limit, contentTypeId: '15' });
  return { items, totalCount, page, limit, sort };
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await searchKeywordPlaces(keyword || DEFAULT_KEYWORD);
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};

