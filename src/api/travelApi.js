import axiosInstance from './axiosInstance';

const KTO_BASE_URL = '/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = '/B551011/KorService2';
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY);

const LDONG_REGN_CD_MAP = {
  '11': '서울', '26': '부산', '27': '대구', '28': '인천',
  '29': '광주', '30': '대전', '31': '울산', '36110': '세종',
  '41': '경기', '43': '충북', '44': '충남', '46': '전남',
  '47': '경북', '48': '경남', '50': '제주', '51': '강원', '52': '전북',
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
    let lDongRegnCd = '11'; // 기본값 서울
    const nameStr = String(areaName || '서울');

    for (const [code, name] of Object.entries(LDONG_REGN_CD_MAP)) {
      if (nameStr.includes(name)) {
        lDongRegnCd = code;
        break;
      }
    }

    console.log(`📍 Requesting near places for: ${nameStr} (Code: ${lDongRegnCd})`);
    const response = await axiosInstance.get('/travel/near', { params: { lDongRegnCd } });
    return response.data;
  } catch (error) {
    console.error('City based places error:', error);
    return [];
  }
};

// 랜덤 추천 (우리 서버 캐시 활용)
export const searchKeywordPlaces = async () => {
  try {
    const response = await axiosInstance.get('/travel/random');
    return response.data;
  } catch {
    return [];
  }
};

// 나머지 유틸리티 함수들 유지...
// 축제/행사 정보 (우리 서버 캐시 활용)
export const getSpontaneousTravel = async (poolSize = 20) => {
  try {
    const response = await axiosInstance.get('/travel/spontaneous', {
      params: { poolSize },
    });
    return response.data;
  } catch (error) {
    console.error('Spontaneous travel error:', error);
    return null;
  }
};

export const getFestivalList = async (page = 1, limit = 8, sort = 'default') => {
  try {
    const response = await axiosInstance.get('/travel/festivals', {
      params: { page, limit, sort }
    });
    return response.data;
  } catch (error) {
    console.error('Festival list error:', error);
    return { items: [], totalCount: 0, totalPages: 0 };
  }
};

export const getWeatherRecommendations = async (_keyword) => {
  const items = await searchKeywordPlaces();
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};

