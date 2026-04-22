import axios from 'axios';

const KTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;

export const getWeatherRecommendations = async (keywords) => {
  try {
    // 키워드 배열 중 하나를 랜덤 선택 (배열이 아니면 단일 키워드 사용)
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    const selectedKeyword = keywordArray[Math.floor(Math.random() * keywordArray.length)];

    const response = await axios.get(`${KTO_BASE_URL}/gallerySearchList1`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows: 20, // 더 많은 후보를 가져옴
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        keyword: selectedKeyword,
      },
    });

    const items = response.data?.response?.body?.items?.item || [];
    if (items.length > 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    
    // 만약 선택된 키워드로 결과가 없으면 첫 번째 키워드로 재시도
    if (keywordArray.length > 1 && selectedKeyword !== keywordArray[0]) {
      return getWeatherRecommendations([keywordArray[0]]);
    }
    
    return null;
  } catch (error) {
    console.error('Travel API Error:', error);
    return null;
  }
};
