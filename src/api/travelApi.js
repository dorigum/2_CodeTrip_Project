import axios from 'axios';

// Vite Proxy 설정(/B551011)을 사용하여 CORS 문제 해결
const KTO_BASE_URL = '/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = '/B551011/KorService1';
const RAW_SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;
const SERVICE_KEY = decodeURIComponent(RAW_SERVICE_KEY);

// 사진 갤러리 목록 가져오기
export const getPhotoList = async (keywords = null, numOfRows = 10) => {
  try {
    const params = {
      serviceKey: SERVICE_KEY,
      numOfRows,
      pageNo: 1,
      MobileOS: 'ETC',
      MobileApp: 'CodeTrip',
      _type: 'json',
    };

    let url = `${KTO_BASE_URL}/galleryList1`;
    if (keywords && keywords.length > 0) {
      url = `${KTO_BASE_URL}/gallerySearchList1`;
      params.keyword = Array.isArray(keywords) ? keywords[0] : keywords;
    }

    const response = await axios.get(url, { params });
    return response.data?.response?.body?.items?.item || [];
  } catch (error) {
    console.error('getPhotoList Error:', error);
    return [];
  }
};

// 축제/행사 목록 가져오기
export const getFestivalList = async (numOfRows = 6) => {
  try {
    const response = await axios.get(`${TOUR_BASE_URL}/searchFestival1`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        listYN: 'Y',
        arrange: 'A',
        eventStartDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      },
    });
    return response.data?.response?.body?.items?.item || [];
  } catch (error) {
    console.error('getFestivalList Error:', error);
    return [];
  }
};

// 지역 기반 장소 가져오기
export const getCityBasedPlaces = async (areaName, numOfRows = 10) => {
  try {
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList1`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        listYN: 'Y',
        arrange: 'A',
      },
    });
    const items = response.data?.response?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('getCityBasedPlaces Error:', error);
    return [];
  }
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await getPhotoList(keyword, 10);
  if (items.length > 0) {
    return items[Math.floor(Math.random() * items.length)];
  }
  return null;
};
