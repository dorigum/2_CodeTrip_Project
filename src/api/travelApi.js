import axios from 'axios';
import { getTravelInfo, getTravelInfoByKeyword } from './travelInfoApi';

const PHOTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const GALLERY_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY || '');

const normalizeImage = (url) => url?.replace('http://', 'https://') || '';

const fetchGallery = async (service, params = {}) => {
  const response = await axios.get(`${PHOTO_BASE_URL}/${service}`, {
    params: {
      serviceKey: GALLERY_KEY,
      MobileOS: 'ETC',
      MobileApp: 'CodeTrip',
      _type: 'json',
      ...params,
    },
  });
  return response.data;
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
    const { items } = await getTravelInfo({ pageNo: 1, numOfRows: 8, lDongRegnCd: String(areaCode || '11') });
    return items;
  } catch (error) {
    console.error('City based places error:', error);
    return [];
  }
};

export const searchKeywordPlaces = async (keyword = '여행') => {
  try {
    const { items } = await getTravelInfoByKeyword({ keyword, pageNo: 1, numOfRows: 20 });
    return items;
  } catch {
    return [];
  }
};

export const getSpontaneousTravel = async (poolSize = 20) => {
  const items = await searchKeywordPlaces('여행');
  if (!items.length) return null;
  return items[Math.floor(Math.random() * Math.min(items.length, poolSize))];
};

export const getFestivalList = async (page = 1, limit = 8, sort = 'default') => {
  const { items, totalCount } = await getTravelInfo({ pageNo: page, numOfRows: limit, contentTypeId: '15' });
  return { items, totalCount, page, limit, sort };
};

export const getWeatherRecommendations = async (_keyword) => {
  const items = await searchKeywordPlaces('여행');
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};
