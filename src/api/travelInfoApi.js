import axios from 'axios';

const API_URL = '/B551011/KorService2';
const RAW_SERVICE_KEY = import.meta.env.VITE_TRAVEL_INFO_API_KEY || import.meta.env.VITE_GALLERY_API_KEY;
const SERVICE_KEY = decodeURIComponent(RAW_SERVICE_KEY);

// 이미지 URL을 보안 프로토콜(https)로 변경하고 데이터 정규화
const normalizeItems = (items) => {
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.map(item => ({
    ...item,
    // http://... 형태의 이미지를 https://...로 변경하여 차단 방지
    firstimage: item.firstimage?.replace('http://', 'https://'),
    firstimage2: item.firstimage2?.replace('http://', 'https://')
  }));
};

export const getTravelInfo = async ({ pageNo = 1, numOfRows = 10, contentTypeId, areaCode } = {}) => {
  try {
    const params = {
      serviceKey: SERVICE_KEY,
      numOfRows,
      pageNo,
      MobileOS: 'ETC',
      MobileApp: 'CodeTrip',
      _type: 'json',
      arrange: 'O', // 제목순(O)으로 변경 (가장 무난함)
    };

    if (contentTypeId && contentTypeId !== '') params.contentTypeId = contentTypeId;
    if (areaCode && areaCode !== '') params.areaCode = areaCode;

    const response = await axios.get(`${API_URL}/areaBasedList2`, { params });
    const body = response.data?.response?.body;
    const items = normalizeItems(body?.items?.item);

    return { 
      items: items, 
      totalCount: Number(body?.totalCount || items.length) 
    };
  } catch (error) {
    console.error('Travel API Fetch Error:', error);
    return { items: [], totalCount: 0 };
  }
};

export const getRegions = async () => {
  try {
    const response = await axios.get(`${API_URL}/areaCode2`, {
      params: {
        serviceKey: SERVICE_KEY,
        numOfRows: 20,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
      },
    });
    const items = response.data?.response?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    return [];
  }
};

export const getDetailCommon = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailCommon2`, {
      params: {
        serviceKey: SERVICE_KEY,
        contentId,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        defaultYN: 'Y',
        firstImageYN: 'Y',
        addrYN: 'Y',
        mapinfoYN: 'Y',
        overviewYN: 'Y',
      },
    });
    const item = response.data?.response?.body?.items?.item;
    const result = Array.isArray(item) ? item[0] : item;
    if (result) result.firstimage = result.firstimage?.replace('http://', 'https://');
    return result || null;
  } catch (error) { return null; }
};

export const getDetailIntro = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailIntro2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const item = response.data?.response?.body?.items?.item;
    return Array.isArray(item) ? item[0] : item;
  } catch (error) { return null; }
};

export const getDetailInfo = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailInfo2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, numOfRows: 100, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const items = response.data?.response?.body?.items?.item || [];
    return { items: Array.isArray(items) ? items : [items] };
  } catch (error) { return { items: [] }; }
};

export const getDetailImage = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailImage2`, {
      params: { serviceKey: SERVICE_KEY, contentId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json', imageYN: 'Y', subImageYN: 'Y' },
    });
    const items = response.data?.response?.body?.items?.item || [];
    const normalized = normalizeItems(items);
    return { items: normalized };
  } catch (error) { return { items: [] }; }
};
