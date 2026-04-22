import axios from 'axios';

const KTO_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';
const SERVICE_KEY = import.meta.env.VITE_GALLERY_API_KEY;

const COMMON_PARAMS = {
  serviceKey: SERVICE_KEY,
  MobileOS: 'ETC',
  MobileApp: 'CodeTrip',
  _type: 'json',
};

// 1. 사진 리스트 가져오기 (MainTopImg, Slot Machine용)
export const getPhotoList = async (keywords = null, numOfRows = 10) => {
  try {
    const isSearch = !!keywords;
    const endpoint = isSearch ? 'gallerySearchList1' : 'galleryList1';
    
    let selectedKeyword = "";
    if (isSearch) {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
      selectedKeyword = keywordArray[Math.floor(Math.random() * keywordArray.length)];
    }

    const response = await axios.get(`${KTO_BASE_URL}/${endpoint}`, {
      params: {
        ...COMMON_PARAMS,
        numOfRows,
        pageNo: Math.floor(Math.random() * 10) + 1,
        ...(isSearch && { keyword: selectedKeyword }),
      },
    });

    const items = response.data?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('Photo API Error:', error);
    return [];
  }
};

// 2. 지역 기반 명소 리스트 (Near Me용)
export const getCityBasedPlaces = async (province) => {
  try {
    const filterKey = province ? province.slice(0, 2) : '서울';
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList1`, {
      params: {
        ...COMMON_PARAMS,
        numOfRows: 40,
        pageNo: 1,
        arrange: 'Q',
        contentTypeId: 12,
      }
    });

    const items = response.data?.response?.body?.items?.item;
    if (!items) return [];
    const itemList = Array.isArray(items) ? items : [items];
    return itemList.filter(item => item.addr1?.includes(filterKey) && item.firstimage);
  } catch (error) {
    return [];
  }
};

// 3. 실시간 축제 정보 (Trending용)
export const getFestivalList = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const response = await axios.get(`${TOUR_BASE_URL}/searchFestival1`, {
      params: {
        ...COMMON_PARAMS,
        numOfRows: 10,
        eventStartDate: today,
        arrange: 'R'
      }
    });
    const items = response.data?.response?.body?.items?.item;
    return Array.isArray(items) ? items : items ? [items] : [];
  } catch (error) {
    return [];
  }
};

// 4. 인기 테마 사진 (Trending용 - 복구 완료)
export const getThemePhotos = async () => {
  try {
    const response = await axios.get(`${KTO_BASE_URL}/galleryList1`, {
      params: {
        ...COMMON_PARAMS,
        numOfRows: 5,
        pageNo: 1,
        arrange: 'A'
      }
    });
    const items = response.data?.response?.body?.items?.item;
    if (!items) return [];
    const list = Array.isArray(items) ? items : [items];
    return list.map(item => ({
      type: 'theme',
      icon: 'landscape',
      title: item.galTitle,
      subtitle: item.galPhotographyLocation,
      image: item.galWebImageUrl
    }));
  } catch (error) {
    console.error('Theme API Error:', error);
    return [];
  }
};
