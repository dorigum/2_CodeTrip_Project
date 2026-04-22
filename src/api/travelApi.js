import axios from 'axios';

const KTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;

export const getWeatherRecommendations = async (keywords, retryCount = 0) => {
  try {
    const isSearch = !!keywords;
    const endpoint = isSearch ? 'gallerySearchList1' : 'galleryList1';
    
    let selectedKeyword = "";
    if (isSearch) {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
      selectedKeyword = keywordArray[Math.floor(Math.random() * keywordArray.length)];
    }

    // 페이지 범위를 안전하게 1~30으로 축소 (데이터가 없는 페이지 방지)
    const randomPage = isSearch ? 1 : Math.floor(Math.random() * 30) + 1;

    const response = await axios.get(`${KTO_BASE_URL}/${endpoint}`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows: isSearch ? 10 : 20,
        pageNo: randomPage,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        ...(isSearch && { keyword: selectedKeyword }),
      },
      timeout: 5000 // 5초 타임아웃
    });

    const items = response.data?.response?.body?.items?.item;
    
    if (items) {
      const itemList = Array.isArray(items) ? items : [items];
      const validItems = itemList.filter(item => item.galWebImageUrl); // 이미지가 있는 것만
      
      if (validItems.length > 0) {
        return isSearch ? validItems[Math.floor(Math.random() * validItems.length)] : validItems;
      }
    }
    
    // 실패 시 최대 2번 더 다른 페이지 시도
    if (retryCount < 2) {
      return getWeatherRecommendations(keywords, retryCount + 1);
    }
    
    return isSearch ? null : [];
  } catch (error) {
    console.error('Travel API Error:', error.message);
    if (retryCount < 2) return getWeatherRecommendations(keywords, retryCount + 1);
    return keywords ? null : [];
  }
};
