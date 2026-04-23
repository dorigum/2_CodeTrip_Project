import axios from 'axios';

const KTO_BASE_URL = '/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = '/B551011/KorService2'; 
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY);

const AREA_CODES = {
  '서울': '1', '인천': '2', '대전': '3', '대구': '4', '광주': '5', '부산': '6', '울산': '7', '세종': '8',
  '경기': '31', '강원': '32', '충북': '33', '충남': '34', '경북': '35', '경남': '36', '전북': '37', '전남': '38', '제주': '39'
};

const normalizeList = (items) => {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
};

export const getPhotoList = async (keywords = null, numOfRows = 10) => {
  try {
    // 다양한 결과를 위해 pageNo를 랜덤하게 설정 (1~10페이지 사이)
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const params = { serviceKey: SERVICE_KEY, numOfRows, pageNo: randomPage, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' };
    
    let url = `${KTO_BASE_URL}/galleryList1`;
    if (keywords) {
      url = `${KTO_BASE_URL}/gallerySearchList1`;
      params.keyword = Array.isArray(keywords) ? keywords[Math.floor(Math.random() * keywords.length)] : keywords;
    }
    
    const response = await axios.get(url, { params });
    const items = response.data?.response?.body?.items?.item;
    return normalizeList(items).map(item => ({
      ...item,
      galWebImageUrl: item.galWebImageUrl?.replace('http://', 'https://')
    }));
  } catch (error) { return []; }
};

export const getFestivalList = async (numOfRows = 6) => {
  try {
    const response = await axios.get(`${TOUR_BASE_URL}/searchFestival2`, {
      params: {
        serviceKey: SERVICE_KEY, numOfRows, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip',
        _type: 'json', listYN: 'Y', arrange: 'A',
        eventStartDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      },
    });
    const items = response.data?.response?.body?.items?.item;
    return normalizeList(items).map(item => ({
      ...item,
      firstimage: item.firstimage?.replace('http://', 'https://')
    }));
  } catch (error) { return []; }
};

export const getCityBasedPlaces = async (areaName, numOfRows = 10) => {
  try {
    const shortName = String(areaName).substring(0, 2);
    const areaCode = AREA_CODES[shortName] || undefined;
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: SERVICE_KEY, numOfRows, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip',
        _type: 'json', listYN: 'Y', arrange: 'O', areaCode
      },
    });
    const items = response.data?.response?.body?.items?.item;
    return normalizeList(items).map(item => ({
      ...item,
      firstimage: item.firstimage?.replace('http://', 'https://')
    }));
  } catch (error) { return []; }
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await getPhotoList(keyword, 10);
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};
