import axios from 'axios';

const API_URL = '/B551011/KorService2'; 
const SERVICE_KEY = import.meta.env.VITE_TRAVEL_INFO_API_KEY || import.meta.env.VITE_GALLERY_API_KEY;

const normalizeItems = (items) => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(item => ({
    ...item,
    firstimage: item.firstimage?.replace('http://', 'https://'),
    originimgurl: item.originimgurl?.replace('http://', 'https://'),
    smallimageurl: item.smallimageurl?.replace('http://', 'https://')
  }));
};

// 리스트 조회
export const getTravelInfo = async ({ pageNo = 1, numOfRows = 10, contentTypeId, areaCode } = {}) => {
  try {
    const params = { serviceKey: SERVICE_KEY, numOfRows, pageNo, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json', arrange: 'O' };
    if (contentTypeId) params.contentTypeId = contentTypeId;
    if (areaCode) params.areaCode = areaCode;
    const response = await axios.get(`${API_URL}/areaBasedList2`, { params });
    const body = response.data?.response?.body;
    return { items: normalizeItems(body?.items?.item), totalCount: Number(body?.totalCount || 0) };
  } catch (error) { return { items: [], totalCount: 0 }; }
};

// 지역 목록
export const getRegions = async () => {
  try {
    const response = await axios.get(`${API_URL}/ldongCode2`, {
      params: { serviceKey: SERVICE_KEY, numOfRows: 20, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const items = response.data?.response?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (error) { return []; }
};

// 상세 공통 정보 (파라미터 완전 최소화)
export const getDetailCommon = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailCommon2`, {
      params: { serviceKey: SERVICE_KEY, contentId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    if (!body || !body.items || !body.items.item) return null;
    const item = body.items.item;
    const result = Array.isArray(item) ? item[0] : item;
    if (result && result.firstimage) result.firstimage = result.firstimage.replace('http://', 'https://');
    return result;
  } catch (error) { return null; }
};

// 상세 소개 정보
export const getDetailIntro = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailIntro2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    if (!body || !body.items || !body.items.item) return null;
    const item = body.items.item;
    return Array.isArray(item) ? item[0] : item;
  } catch (error) { return null; }
};

// 상세 반복 정보
export const getDetailInfo = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailInfo2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    const items = body?.items?.item || [];
    return { items: Array.isArray(items) ? items : [items] };
  } catch (error) { return { items: [] }; }
};

// 상세 이미지 정보
export const getDetailImage = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailImage2`, {
      params: { serviceKey: SERVICE_KEY, contentId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    const items = body?.items?.item || [];
    return { items: normalizeItems(items) };
  } catch (error) { return { items: [] }; }
};
