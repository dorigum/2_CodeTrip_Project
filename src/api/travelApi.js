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
    let areaCode = '1'; // 기본값 서울
    const nameStr = String(areaName || '서울');
    
    // 더 정교한 매핑: 입력받은 이름에 포함되어 있는지 확인
    for (const [name, code] of Object.entries(AREA_CODES)) {
      if (nameStr.includes(name)) { 
        areaCode = code; 
        break; 
      }
    }

    console.log(`📍 Requesting near places for: ${nameStr} (Code: ${areaCode})`);
    const response = await axiosInstance.get('/travel/near', { params: { areaCode } });
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
  } catch (error) {
    return [];
  }
};

// 나머지 유틸리티 함수들 유지...
// 축제/행사 정보 (우리 서버 캐시 활용)
export const getFestivalList = async () => {
  try {
    const response = await axiosInstance.get('/travel/festivals');
    return response.data;
  } catch (error) {
    console.error('Festival list error:', error);
    return [];
  }
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await searchKeywordPlaces();
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};

