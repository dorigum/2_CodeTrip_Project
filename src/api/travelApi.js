import axios from 'axios';
import axiosInstance from './axiosInstance';

const KTO_BASE_URL = '/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = '/B551011/KorService2';
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY);

const AREA_CODES = {
  '서울': '1', '인천': '2', '대전': '3', '대구': '4', '광주': '5', '부산': '6', '울산': '7', '세종': '8',
  '경기': '31', '강원': '32', '충북': '33', '충남': '34', '경북': '35', '경남': '36', '전북': '37', '전남': '38', '제주': '39'
};

// 메인 슬라이더용 사진 가져오기 (우리 서버 캐시 활용)
export const getPhotoList = async () => {
  try {
    const response = await axiosInstance.get('/travel/top-images');
    return response.data;
  } catch (error) {
    console.error('Photo cache error:', error);
    return [];
  }
};

// 지역 기반 추천 (우리 서버 캐시 활용)
export const getCityBasedPlaces = async (areaName) => {
  try {
    let areaCode = '1';
    const nameStr = String(areaName || '서울');
    for (const [name, code] of Object.entries(AREA_CODES)) {
      if (nameStr.includes(name)) { areaCode = code; break; }
    }

    const response = await axiosInstance.get('/travel/near', { params: { areaCode } });
    return response.data;
  } catch (error) {
    return [];
  }
};

// 랜덤 추천 (우리 서버 캐시 활용)
export const searchKeywordPlaces = async () => {
  try {
    const response = await axiosInstance.get('/travel/random');
    return response.data;
  } catch (error) {
    return [];
  }
};

// 나머지 유틸리티 함수들 유지...
export const getFestivalList = async (numOfRows = 10) => {
  try {
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: SERVICE_KEY, numOfRows, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip',
        _type: 'json', listYN: 'Y', arrange: 'Q', contentTypeId: '15'
      },
    });
    const items = response.data?.response?.body?.items?.item || [];
    const list = Array.isArray(items) ? items : [items];
    return list.map(item => ({
      ...item,
      firstimage: (item.firstimage || item.firstimage2 || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070')?.replace('http://', 'https/'),
      eventstartdate: item.createdtime?.slice(4, 8) || 'NOW'
    }));
  } catch (error) { return []; }
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await searchKeywordPlaces();
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};

