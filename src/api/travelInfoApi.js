import axios from 'axios';

const API_URL = '/B551011/KorService2'; 
const SERVICE_KEY = decodeURIComponent(import.meta.env.VITE_TRAVEL_INFO_API_KEY || import.meta.env.VITE_GALLERY_API_KEY);

const normalizeItems = (items) => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(item => ({
    ...item,
    firstimage: (item.firstimage || item.originimgurl || item.galWebImageUrl || '')?.replace('http://', 'https://'),
    originimgurl: (item.originimgurl || item.firstimage || '')?.replace('http://', 'https://')
  }));
};

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

export const getRegions = async () => {
  try {
    const response = await axios.get(`${API_URL}/areaCode2`, {
      params: { serviceKey: SERVICE_KEY, numOfRows: 20, pageNo: 1, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const items = response.data?.response?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (error) { return []; }
};

// 3. 상세 공통 정보 (에러 유발 파라미터 완전 제거 - 오직 필수값만)
export const getDetailCommon = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailCommon2`, {
      params: {
        serviceKey: SERVICE_KEY,
        contentId: contentId,
        MobileOS: 'ETC',
        MobileApp: 'CodeTrip',
        _type: 'json',
        defaultYN: 'Y',
        firstImageYN: 'Y',
        addrYN: 'Y',
        mapinfoYN: 'Y',
        overviewYN: 'Y'
      },
    });

    const body = response.data?.response?.body;
    // resultCode가 '0000'이 아니거나 items가 없으면 실패로 간주
    if (response.data?.response?.header?.resultCode !== '0000' || !body?.items?.item) {
      console.warn('API Response Error for ID:', contentId, response.data);
      return null;
    }

    const item = body.items.item;
    const result = Array.isArray(item) ? item[0] : item;
    if (result && result.firstimage) result.firstimage = result.firstimage.replace('http://', 'https://');
    return result;
  } catch (error) {
    return null;
  }
};

export const getDetailIntro = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailIntro2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    if (!body?.items?.item) return null;
    return Array.isArray(body.items.item) ? body.items.item[0] : body.items.item;
  } catch (error) { return null; }
};

export const getDetailInfo = async (contentId, contentTypeId) => {
  try {
    const response = await axios.get(`${API_URL}/detailInfo2`, {
      params: { serviceKey: SERVICE_KEY, contentId, contentTypeId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json' },
    });
    const body = response.data?.response?.body;
    return { items: normalizeItems(body?.items?.item) };
  } catch (error) { return { items: [] }; }
};

export const getDetailImage = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/detailImage2`, {
      params: { serviceKey: SERVICE_KEY, contentId, MobileOS: 'ETC', MobileApp: 'CodeTrip', _type: 'json', imageYN: 'Y', subImageYN: 'Y' },
    });
    const body = response.data?.response?.body;
    return { items: normalizeItems(body?.items?.item) };
  } catch (error) { return { items: [] }; }
};
