import axios from 'axios';

const KTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';
const SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;

// 사진 갤러리 목록 가져오기 (Home.jsx의 getPhotoList 대응)
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

// 축제/행사 목록 가져오기 (Home.jsx의 getFestivalList 대응)
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

// 지역 기반 장소 가져오기 (Home.jsx의 getCityBasedPlaces 대응)
export const getCityBasedPlaces = async (areaName, numOfRows = 10) => {
  try {
    // 지역 이름을 코드로 매핑하는 로직이 필요할 수 있으나, 
    // 우선은 키워드 검색으로 대체하거나 기본 지역 목록을 가져옵니다.
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
        // 지역 코드를 알 수 없으므로 우선 전체 리스트를 가져오거나 키워드로 처리
      },
    });
    return response.data?.response?.body?.items?.item || [];
  } catch (error) {
    console.error('getCityBasedPlaces Error:', error);
    return [];
  }
};

// 기존에 존재하던 함수 유지 (Explore 등에서 사용 가능)
export const getWeatherRecommendations = async (keyword) => {
  const items = await getPhotoList(keyword, 10);
  if (items.length > 0) {
    return items[Math.floor(Math.random() * items.length)];
  }
  return null;
};
