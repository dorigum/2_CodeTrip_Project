import axios from 'axios';
import { cachedApiRequest } from './apiCache';

const TOUR_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_TRAVEL_INFO_API_URL || 'KorService2'}`;
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_TRAVEL_INFO_API_KEY || '');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const CACHE_TTL = {
  list: 12 * HOUR,
  keyword: 6 * HOUR,
  detail: 14 * DAY,
  regions: 30 * DAY,
};

const normalizeItems = (items) => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map((item) => ({
    ...item,
    firstimage: (item.firstimage || item.originimgurl || item.galWebImageUrl || '')?.replace('http://', 'https://'),
    originimgurl: (item.originimgurl || item.firstimage || '')?.replace('http://', 'https://'),
  }));
};

const fetchTourApi = async (service, params = {}, ttlMs = CACHE_TTL.list) => {
  const requestParams = {
    serviceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'CodeTrip',
    _type: 'json',
    ...params,
  };

  return cachedApiRequest({
    scope: 'tour',
    service,
    params: requestParams,
    ttlMs,
    fetcher: async () => {
      const response = await axios.get(`${TOUR_BASE_URL}/${service}`, {
        params: requestParams,
      });
      return response.data;
    },
  });
};

export const getTravelList = async ({ regions = [''], themes = [''], pageNo = 1, numOfRows = 10, keyword = '', sort = 'default' } = {}) => {
  const contentTypeId = themes.find(Boolean) || undefined;
  const lDongRegnCd = regions.find(Boolean) || undefined;

  const data = keyword
    ? await fetchTourApi('searchKeyword2', { keyword, pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: sort === 'title' ? 'A' : 'O' }, CACHE_TTL.keyword)
    : await fetchTourApi('areaBasedList2', { pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: sort === 'title' ? 'A' : 'O' }, CACHE_TTL.list);

  const body = data?.response?.body || {};
  return {
    items: normalizeItems(body.items?.item),
    totalCount: Number(body.totalCount || 0),
  };
};

export const getDetailCommon = async (contentId) => {
  const data = await fetchTourApi('detailCommon2', { contentId }, CACHE_TTL.detail);
  const item = data?.response?.body?.items?.item;
  const result = Array.isArray(item) ? item[0] : item;
  if (result?.firstimage) result.firstimage = result.firstimage.replace('http://', 'https://');
  return result || null;
};

export const getDetailIntro = async (contentId, contentTypeId) => {
  const data = await fetchTourApi('detailIntro2', { contentId, contentTypeId }, CACHE_TTL.detail);
  const item = data?.response?.body?.items?.item;
  return Array.isArray(item) ? item[0] : item || null;
};

export const getDetailInfo = async (contentId, contentTypeId) => {
  const data = await fetchTourApi('detailInfo2', { contentId, contentTypeId }, CACHE_TTL.detail);
  return { items: normalizeItems(data?.response?.body?.items?.item) };
};

export const getDetailImage = async (contentId) => {
  const data = await fetchTourApi('detailImage2', { contentId }, CACHE_TTL.detail);
  return { items: normalizeItems(data?.response?.body?.items?.item) };
};

export const getRegions = async () => {
  const data = await fetchTourApi('ldongCode2', { numOfRows: 20, pageNo: 1 }, CACHE_TTL.regions);
  return normalizeItems(data?.response?.body?.items?.item);
};

export const getTravelInfo = async ({ pageNo = 1, numOfRows = 10, contentTypeId, lDongRegnCd } = {}) => {
  const data = await fetchTourApi('areaBasedList2', { pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: 'O' }, CACHE_TTL.list);
  const body = data?.response?.body || {};
  return { items: normalizeItems(body.items?.item), totalCount: Number(body.totalCount || 0) };
};

export const getTravelInfoByKeyword = async ({ keyword, pageNo = 1, numOfRows = 10, contentTypeId, lDongRegnCd } = {}) => {
  const data = await fetchTourApi('searchKeyword2', { keyword, pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: 'O' }, CACHE_TTL.keyword);
  const body = data?.response?.body || {};
  return { items: normalizeItems(body.items?.item), totalCount: Number(body.totalCount || 0) };
};
