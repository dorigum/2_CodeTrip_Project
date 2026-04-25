import axiosInstance from './axiosInstance';

// 개별 named exports 추가 (MyPage.jsx 등의 호환성용)
export const fetchWishlistDetails = () => {
  return axiosInstance.get('/wishlist/details'); // /api 제거
};

export const toggleWishlist = (travelData, folderId = null) => {
  // travelData.contentid 또는 travelData.contentId 모두 대응 가능하도록 처리
  const contentId = travelData.contentid || travelData.contentId;
  return axiosInstance.post('/wishlist/toggle', {
    contentId: contentId,
    title: travelData.title,
    imageUrl: travelData.firstimage || travelData.firstImage,
    folderId: folderId
  });
};

const wishlistApi = {
  toggleWishlist,
  fetchWishlistDetails,
  // getWishlistDetails 명칭도 지원 (내부 참조용)
  getWishlistDetails: fetchWishlistDetails,
  getFolders: () => axiosInstance.get('/wishlist/folders'), // /api 제거
  createFolder: (name) => axiosInstance.post('/wishlist/folders', { name }), // /api 제거
  deleteFolder: (folderId) => axiosInstance.delete(`/wishlist/folders/${folderId}`), // /api 제거
  moveWishlistItem: (contentId, folderId) => axiosInstance.put('/wishlist/move', { contentId, folderId }) // /api 제거
};

export default wishlistApi;
