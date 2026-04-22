import axios from 'axios';

const KTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;

export const getWeatherRecommendations = async (keyword) => {
  try {
    const response = await axios.get(`${KTO_BASE_URL}/gallerySearchList1`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows: 10,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        keyword: keyword,
      },
    });

    const items = response.data?.response?.body?.items?.item || [];
    // 받아온 아이템 중 랜덤으로 1개 선택
    if (items.length > 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    return null;
  } catch (error) {
    console.error('Travel API Error:', error);
    return null;
  }
};
