import axios from 'axios';

const normalizeItems = (items) => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map(item => ({
    ...item,
    firstimage: (item.firstimage || item.originimgurl || item.galWebImageUrl || '')?.replace('http://', 'https://'),
    originimgurl: (item.originimgurl || item.firstimage || '')?.replace('http://', 'https://')
  }));
};

// --- Proxy Helper ---
const fetchViaProxy = async (service, params = {}) => {
  try {
    const response = await axios.get(`/api/travel/proxy/${service}`, { params });
    return response.data;
  } catch (error) {
    console.error(`[Proxy Error] ${service}:`, error.message);
    return null;
  }
};

// 서버 통합 조회 (멀티필터 + 서버사이드 페이지네이션)
export const getTravelList = async ({ regions = [''], themes = [''], pageNo = 1, numOfRows = 10, keyword = '', sort = 'default' } = {}) => {
  try {
    const response = await axios.get('/api/travel', {
      params: {
        regions: regions.join(','),
        themes: themes.join(','),
        pageNo,
        numOfRows,
        sort,
        ...(keyword ? { keyword } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { items: [], totalCount: 0 };
  }
};

// 상세 정보 호출들을 모두 프록시 경유로 변경
export const getDetailCommon = async (contentId) => {
  const data = await fetchViaProxy('detailCommon2', { contentId });
  const body = data?.response?.body;
  if (!body?.items?.item) return null;
  const item = body.items.item;
  const result = Array.isArray(item) ? item[0] : item;
  if (result && result.firstimage) result.firstimage = result.firstimage.replace('http://', 'https://');
  return result;
};

export const getDetailIntro = async (contentId, contentTypeId) => {
  const data = await fetchViaProxy('detailIntro2', { contentId, contentTypeId });
  const body = data?.response?.body;
  if (!body?.items?.item) return null;
  return Array.isArray(body.items.item) ? body.items.item[0] : body.items.item;
};

export const getDetailInfo = async (contentId, contentTypeId) => {
  const data = await fetchViaProxy('detailInfo2', { contentId, contentTypeId });
  const body = data?.response?.body;
  return { items: normalizeItems(body?.items?.item) };
};

export const getDetailImage = async (contentId) => {
  const data = await fetchViaProxy('detailImage2', { contentId });
  const body = data?.response?.body;
  return { items: normalizeItems(body?.items?.item) };
};

// --- 지역 정보 조회 (복구 완료) ---
export const getRegions = async () => {
  const data = await fetchViaProxy('ldongCode2', { numOfRows: 20, pageNo: 1 });
  const items = data?.response?.body?.items?.item || [];
  return Array.isArray(items) ? items : [items];
};

// --- 기타 리스트 조회 ---
export const getTravelInfo = async ({ pageNo = 1, numOfRows = 10, contentTypeId, lDongRegnCd } = {}) => {
  const data = await fetchViaProxy('areaBasedList2', { pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: 'O' });
  const body = data?.response?.body;
  return { items: normalizeItems(body?.items?.item), totalCount: Number(body?.totalCount || 0) };
};

export const getTravelInfoByKeyword = async ({keyword, pageNo = 1, numOfRows = 10, contentTypeId, lDongRegnCd} = {}) => {
  const data = await fetchViaProxy('searchKeyword2', { keyword, pageNo, numOfRows, contentTypeId, lDongRegnCd, arrange: 'O' });
  const body = data?.response?.body;
  return { items: normalizeItems(body?.items?.item), totalCount: Number(body?.totalCount || 0) };
};
