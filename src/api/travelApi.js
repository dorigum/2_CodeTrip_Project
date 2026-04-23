import axios from 'axios';

const KTO_BASE_URL = '/B551011/PhotoGalleryService1';
const TOUR_BASE_URL = '/B551011/KorService2'; // 사용자 키와 호환되는 2번 버전으로 원복
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_GALLERY_API_KEY);

const AREA_CODES = {
  '서울': '1', '인천': '2', '대전': '3', '대구': '4', '광주': '5', '부산': '6', '울산': '7', '세종': '8',
  '경기': '31', '강원': '32', '충북': '33', '충남': '34', '경북': '35', '경남': '36', '전북': '37', '전남': '38', '제주': '39'
};

const normalizeList = (items) => {
  if (!items || items === "") return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(item => ({
    ...item,
    firstimage: (item.firstimage || item.firstimage2 || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070')?.replace('http://', 'https://'),
    galWebImageUrl: item.galWebImageUrl?.replace('http://', 'https://')
  }));
};

export const getPhotoList = async (keywords = null, numOfRows = 10) => {
  try {
    const randomPage = Math.floor(Math.random() * 30) + 1;
    const params = { serviceKey: SERVICE_KEY, numOfRows, pageNo: randomPage, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' };
    let url = `${KTO_BASE_URL}/galleryList1`;
    if (keywords && keywords.length > 0) {
      url = `${KTO_BASE_URL}/gallerySearchList1`;
      params.keyword = keywords[Math.floor(Math.random() * keywords.length)];
    }
    const response = await axios.get(url, { params });
    return normalizeList(response.data?.response?.body?.items?.item);
  } catch (error) { return []; }
};

export const getFestivalList = async (numOfRows = 10) => {
  try {
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: SERVICE_KEY, numOfRows, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip',
        _type: 'json', listYN: 'Y', arrange: 'Q', contentTypeId: '15'
      },
    });
    const items = normalizeList(response.data?.response?.body?.items?.item);
    return items.map(item => ({
      ...item,
      eventstartdate: item.createdtime?.slice(4, 8) || 'NOW'
    }));
  } catch (error) { return []; }
};

export const getCityBasedPlaces = async (areaName, numOfRows = 10) => {
  try {
    let areaCode = '1';
    const nameStr = String(areaName || '서울');
    for (const [name, code] of Object.entries(AREA_CODES)) {
      if (nameStr.includes(name)) { areaCode = code; break; }
    }

    // KorService2의 areaBasedList2 사용
    const response = await axios.get(`${TOUR_BASE_URL}/areaBasedList2`, {
      params: {
        serviceKey: SERVICE_KEY, 
        numOfRows, 
        pageNo: 1, 
        MobileOS: 'ETC', 
        MobileApp: 'CodeTrip',
        _type: 'json', 
        areaCode: areaCode, 
        contentTypeId: '12',
        arrange: 'Q' // 데이터 누락을 방지하기 위해 수정일순(Q)으로 변경
      },
    });
    const items = normalizeList(response.data?.response?.body?.items?.item);
    return items;
  } catch (error) { 
    return []; 
  }
};

export const getWeatherRecommendations = async (keyword) => {
  const items = await getPhotoList(keyword, 10);
  if (items.length > 0) return items[Math.floor(Math.random() * items.length)];
  return null;
};
