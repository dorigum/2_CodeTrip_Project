import axiosInstance from './axiosInstance';

// 개별 named exports 추가 (MyPage.jsx 등의 호환성용)
export const fetchWishlistDetails = () => {
  return axiosInstance.get('/api/wishlist/details');
};

export const toggleWishlist = (travelData, folderId = null) => {
  return axiosInstance.post('/api/wishlist/toggle', {
    contentId: travelData.contentid,
    title: travelData.title,
    imageUrl: travelData.firstimage,
    folderId: folderId
  });
};

const wishlistApi = {
  toggleWishlist,
  fetchWishlistDetails,
  // getWishlistDetails 명칭도 지원 (내부 참조용)
  getWishlistDetails: fetchWishlistDetails,
  getFolders: () => axiosInstance.get('/api/wishlist/folders'),
  createFolder: (name) => axiosInstance.post('/api/wishlist/folders', { name }),
  deleteFolder: (folderId) => axiosInstance.delete(`/api/wishlist/folders/${folderId}`),
  moveWishlistItem: (contentId, folderId) => axiosInstance.put('/api/wishlist/move', { contentId, folderId })
};

export default wishlistApi;
